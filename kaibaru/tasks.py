from celery import shared_task
from django.utils import timezone
from django.conf import settings
import stripe
import logging

from .models import Club
from .views import sync_member_quantity, add_one_month

logger = logging.getLogger(__name__)

from .models import Participation

@shared_task
def reset_monthly_participation_counts():
    """
    Monthly task:
    - Reset participation monthly counts
    - Reset level counts if enabled
    - Run once per month safely
    """

    today = timezone.localdate()


    clubs = Club.objects.all()

    for club in clubs:
        # Skip if already reset this month
        if club.last_reset and (
            club.last_reset.year == today.year
            and club.last_reset.month == today.month
        ):
            continue

        Participation.objects.filter(
            member__club=club
        ).update(monthly_count=0)


        club.last_reset = today
        club.save()

        logger.info(
            f"[CELERY] Monthly reset completed for club={club.id}"
        )


@shared_task
def reconcile_stripe_subscriptions():
    """
    Daily safety-net task:
    - Reconcile Stripe member quantities
    - Ensure subscription status is correct
    - Extend expiration only for NEW paid invoices
    - Freeze or delete expired clubs safely
    """

    today = timezone.localdate()

    stripe.api_key = settings.STRIPE_SECRET_KEY

    clubs = Club.objects.all()

    for club in clubs:
        try:
            # ----------------------------------------
            # Clubs WITH a Stripe subscription
            # ----------------------------------------
            if club.stripe_subscription_id:
                try:
                    sub = stripe.Subscription.retrieve(club.stripe_subscription_id)
                except stripe.error.InvalidRequestError:
                    logger.warning(
                        f"[CELERY] Stripe subscription missing for club={club.id}"
                    )
                    club.subscription_active = False
                    club.stripe_subscription_id = None
                    club.save()
                    continue


                if club.expiration_date:
                    days_expired = max((today - club.expiration_date).days, 0)
                else:
                    days_expired = 0
                if days_expired >= 28:
                    logger.warning(
                        f"[CELERY] Deleting unpaid subscription club={club.id}"
                    )
                    canceled = False
                    try:
                        stripe.Subscription.delete(club.stripe_subscription_id)
                        canceled = True
                        logger.info(
                            f"[CELERY] Stripe subscription canceled for club={club.id}"
                        )
                    except Exception as e:
                        logger.error(
                            f"[CELERY] Failed to cancel Stripe sub for club={club.id}: {e}"
                        )

                    if canceled:
                        club.delete()
                    else:
                        club.subscription_active = False
                        club.save()

                    continue



                if sub.status != "active":
                    if club.subscription_active:
                        logger.warning(
                            f"[CELERY] Subscription inactive: club={club.id}"
                        )
                    club.subscription_active = False
                    club.save()
                  
                    continue

                # 🔑 CORE: reconcile member quantity
                sync_member_quantity(club)

                # Check latest invoice
                invoices = stripe.Invoice.list(
                    customer=club.stripe_customer_id,
                    limit=1
                )

                if invoices.data:
                    invoice = invoices.data[0]

                    if invoice.status == "paid" and invoice.id != club.last_paid_invoice_id:
                        club.last_paid_invoice_id = invoice.id
                        club.expiration_date = add_one_month(
                            club.expiration_date or today
                        )
                        club.subscription_active = True
                        club.save()

                        logger.info(
                            f"[CELERY] Invoice applied: club={club.id}, "
                            f"invoice={invoice.id}, expiration={club.expiration_date}"
                        )

            # ----------------------------------------
            # Clubs WITHOUT a Stripe subscription
            # ----------------------------------------
            else:
                if club.expiration_date:
                    days_expired = max((today - club.expiration_date).days, 0)

                    if days_expired >= 1 and club.subscription_active:
                        club.subscription_active = False
                        club.save()

                    # Hard delete after 7 days
                    if days_expired >= 7:
                        logger.warning(
                            f"[CELERY] Deleting expired club={club.id}"
                        )
                        club.delete()

        except stripe.error.InvalidRequestError as e:
            logger.error(
                f"[CELERY] Stripe error for club={club.id}: {e}"
            )
            club.subscription_active = False
            club.save()

        except Exception as e:
            logger.exception(
                f"[CELERY] Unexpected error for club={club.id}: {e}"
            )

