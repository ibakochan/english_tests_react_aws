from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse, HttpResponseForbidden
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.conf import settings
import stripe
from .models import Member, MembershipPlan, MemberSubscription
from .tasks import cancel_stripe_subscription
from .tasks_emails import send_subscription_activated_emails, send_subscription_canceled_emails
from django.utils import timezone

stripe.api_key = settings.STRIPE_SECRET_KEY
 

@login_required
@require_POST
def create_member_checkout_session(request, member_id):
    """
    Create a Stripe checkout session for a member subscription.
    """
    member = get_object_or_404(Member, id=member_id)
    club = member.club

    if club.owner != request.user:
        return HttpResponseForbidden("You do not own this club")

    plan_id = request.POST.get("plan_id")
    plan = get_object_or_404(MembershipPlan, id=plan_id)
 
    if not member.user.stripe_customer_id:
        customer = stripe.Customer.create(
            name=member.full_name,
            email=member.user.email,
            metadata={"member_id": member.id, "club_id": club.id},
        )
        member.user.stripe_customer_id = customer.id
        member.user.save()
    else:
        customer = stripe.Customer.retrieve(member.user.stripe_customer_id)
 
    session = stripe.checkout.Session.create(
        customer=customer.id,
        mode="subscription",
        payment_method_types=["card"],
        line_items=[
            {"price": plan.stripe_price_id, "quantity": 1}
        ],
        metadata={
            "member_id": member.id,
            "plan_id": plan.id,
            "club_id": club.id,
        },
        success_url=f"https://{club.subdomain}.kaibaru.jp/?payment=success",
        cancel_url=f"https://{club.subdomain}.kaibaru.jp/?payment=cancel",
    )

    return JsonResponse({"id": session.id})


@csrf_exempt
def member_stripe_webhook(request):
    """
    Handle Stripe webhook for member subscriptions.
    """
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        return HttpResponse(status=400)
 
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        member_id = session["metadata"].get("member_id")
        plan_id = session["metadata"].get("plan_id")
        club_id = session["metadata"].get("club_id")

        member = Member.objects.filter(id=member_id).first()
        plan = MembershipPlan.objects.filter(id=plan_id).first()
        if not member or not plan:
            return HttpResponse(status=200)
 
        sub, _ = MemberSubscription.objects.get_or_create(member=member)
        sub.plan = plan
        sub.stripe_subscription_id = session.get("subscription")
        sub.status = "active"
        sub.save()
 
        send_subscription_activated_emails.delay(club_id, session.get("subscription"))
 
    elif event["type"] in ("invoice.paid", "invoice.payment_succeeded"):
        invoice = event["data"]["object"]
        subscription_id = invoice["subscription"]

        sub = MemberSubscription.objects.filter(stripe_subscription_id=subscription_id).first()
        if sub:
            sub.status = "active"
            sub.current_period_end = timezone.datetime.fromtimestamp(invoice["current_period_end"])
            sub.save()
 
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        subscription_id = subscription["id"]

        sub = MemberSubscription.objects.filter(stripe_subscription_id=subscription_id).first()
        if sub:
            sub.status = "canceled"
            sub.cancel_at_period_end = True
            sub.save()
            send_subscription_canceled_emails.delay({
                "subdomain": sub.member.club.subdomain,
                "owner_name": sub.member.club.owner.get_full_name(),
                "owner_email": sub.member.club.owner.email,
            })

    return HttpResponse(status=200)
