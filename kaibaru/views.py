from django.shortcuts import render
from django.views import View
from allauth.socialaccount.models import SocialAccount
from django.http import HttpResponseForbidden  
from django.shortcuts import get_object_or_404
from .models import Club, Participation, Member
from django.shortcuts import redirect
from urllib.parse import urlencode
from urllib.parse import quote
import logging
from django.core.files.storage import default_storage
import stripe
import calendar
import time
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from datetime import date
from django.utils import timezone
from .tasks import cancel_stripe_subscription

from .tasks_emails import send_subscription_activated_emails, send_subscription_canceled_emails
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.http import HttpResponseForbidden

from django.views.decorators.csrf import csrf_exempt

from django.utils import timezone
from .utils import add_one_month


logger = logging.getLogger(__name__)
 


@csrf_exempt
def stripe_webhook(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        logger.error(f"[WEBHOOK ERROR] {e}")
        return HttpResponse(status=400)
 
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        club_id = session["metadata"].get("club_id")
        subscription_id = session.get("subscription")

        club = Club.objects.filter(id=club_id, is_deleted=False).first()
        if not club:
            return HttpResponse(status=200)
 
        if not club.stripe_subscription_id:
            club.stripe_subscription_id = subscription_id
            club.save()

        logger.info(f"[CHECKOUT COMPLETE] club={club.id}, sub={subscription_id}")
 
    elif event["type"] in ("invoice.paid", "invoice.payment_succeeded"):
        invoice = event["data"]["object"]



        invoice_id = invoice["id"]
        customer_id = invoice["customer"]

        club = Club.objects.filter(stripe_customer_id=customer_id, is_deleted=False).first()
        if not club:
            return HttpResponse(status=200)
 
        if club.last_paid_invoice_id == invoice_id:
            return HttpResponse(status=200)

        club.last_paid_invoice_id = invoice_id
 
        base = club.expiration_date or timezone.localdate()
        club.expiration_date = add_one_month(base)
        club.subscription_active = True
        club.save()

        send_subscription_activated_emails.delay(
            club.id,
            invoice_id,
        )


        logger.info(
            f"[PAYMENT OK] club={club.id}, invoice={invoice_id}, new_expiration={club.expiration_date}"
        )

    return HttpResponse(status=200)






@require_POST
@login_required
def create_checkout_session(request, club_id):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    club = get_object_or_404(Club, id=club_id, is_deleted=False)

    if club.owner != request.user:
        return HttpResponseForbidden("You do not own this club")
 
    if not club.stripe_customer_id:
        customer = stripe.Customer.create(
            name=club.title or club.subdomain,
            metadata={"club_id": str(club.id)},
        )
        club.stripe_customer_id = customer.id
        club.save()
    else:
        customer = stripe.Customer.retrieve(club.stripe_customer_id)

    active_members = Member.objects.filter(
        club=club
    ).exclude(is_kyukai=True, is_kyukai_paid=True).count()

    billable_members = max(active_members, 1)  

    session = stripe.checkout.Session.create(
        customer=customer.id,
        mode="subscription",
        payment_method_types=["card"],
        line_items=[
            {"price": settings.STRIPE_BASE_PRICE_ID, "quantity": 1},
            {"price": settings.STRIPE_MEMBER_PRICE_ID, "quantity": billable_members},
        ],
        metadata={"club_id": club.id},
        success_url=f"https://{club.subdomain}.kaibaru.jp/?payment=success",
        cancel_url=f"https://{club.subdomain}.kaibaru.jp/?payment=cancel",
    )

    return JsonResponse({"id": session.id})




 











@require_POST
@login_required
def unsubscribe(request, club_id):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    today = timezone.localdate()
    try:

        club = get_object_or_404(Club, id=club_id, is_deleted=False)

        if club.owner != request.user:
            return HttpResponseForbidden("You do not own this club")

        subdomain = request.POST.get("subdomain")
        join_key = request.POST.get("join_key")

        if subdomain != club.subdomain or join_key != club.join_key:
            return JsonResponse(
                {"error": "Confirmation failed"},
                status=400
           )

        subscription_id = club.stripe_subscription_id

        club_data = {
            "subdomain": club.subdomain,
            "owner_name": club.owner.get_full_name() if club.owner else "",
            "owner_email": club.owner.email if club.owner else None,
        }

        if club.stripe_subscription_id:
            cancel_stripe_subscription.delay(subscription_id)

        send_subscription_canceled_emails.delay(club_data)

        club.is_deleted = True
        club.deleted_at = today
        club.save()

        return JsonResponse({"success": True, "message": "Subscription canceled"})
    except Club.DoesNotExist:
        return JsonResponse({"error": "Club not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)





def start_google_login(request):
    next_url = request.GET.get('next')
    if next_url:
        request.session['next_subdomain'] = next_url
    else:
        request.session['next_subdomain'] = "https://kaibaru.jp/"  
    return redirect("/account/google/login/")


class KaibaruPageView(View):
    template_name = 'kaibaru/kaibaru.html'

    def get(self, request):
        user = ""
        has_google = False

        subdomain = request.get_host().split('.')[0]
        
        club = Club.objects.filter(subdomain=subdomain, is_deleted=False).first()

        club_data = {
            'title': club.title if club and club.title else 'ホームページ兼会員管理システム作成',
            'search_description': club.search_description if club and club.search_description else 'Wordのようにページを作成でき、会員管理システムです',
            'favicon': club.favicon.url if club and club.favicon else 'https://storage.googleapis.com/ibaru_repair/kaibarufavicon.png',
            'og_image': club.og_image.url if club and club.og_image else 'https://storage.googleapis.com/ibaru_repair/kaibarufavicon.png',
            'subdomain': subdomain or 'kaibaru',
        }


        if request.user.is_authenticated:
            user = request.user
            has_google = SocialAccount.objects.filter(user=user, provider='google').exists()

        return render(request, self.template_name, {
            'user': user,
            'has_google': has_google,
            'club_data': club_data,
            'stripe_publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
        })



