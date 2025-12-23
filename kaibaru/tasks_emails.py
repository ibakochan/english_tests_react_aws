from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from .models import Club
 

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=60,
    retry_kwargs={"max_retries": 5},
)
def send_club_deleted_emails(self, club_data):
    """
    club_data is a dict because the Club row is already deleted
    """
    owner_email = club_data["owner_email"]
    owner_name = club_data["owner_name"]
    subdomain = club_data["subdomain"]
    reason = club_data["reason"]

    # Admin
    send_mail(
        subject=f"[Kaibaru] Club deleted ({subdomain})",
        message=(
            f"Club: {subdomain}\n"
            f"Owner: {owner_name}\n"
            f"Email: {owner_email}\n"
            f"Reason: {reason}\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.SERVER_EMAIL],
    )

    # Owner (Japanese)
    send_mail(
        subject="【Kaibaru】クラブが削除されました",
        message=(
            f"{owner_name} 様\n\n"
            f"クラブ「{subdomain}」は以下の理由により削除されました。\n\n"
            f"{reason}\n\n"
            f"ご不明な点がございましたら、Kaibaru サポートまでご連絡ください。\n\n"
            f"Kaibaru 運営チーム"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[owner_email],
    )


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=60,
    retry_kwargs={"max_retries": 5},
)
def send_subscription_canceled_emails(self, club_data):
    owner_email = club_data["owner_email"]
    owner_name = club_data["owner_name"]
    subdomain = club_data["subdomain"]

    # ----------------------------
    # Admin
    # ----------------------------
    send_mail(
        subject=f"[Kaibaru] Subscription canceled ({subdomain})",
        message=(
            f"Club: {subdomain}\n"
            f"Owner: {owner_name}\n"
            f"Email: {owner_email}\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.SERVER_EMAIL],
    )

    # ----------------------------
    # Owner (Japanese)
    # ----------------------------
    send_mail(
        subject="【Kaibaru】ご利用プランの解約が完了しました",
        message=(
            f"{owner_name} 様\n\n"
            f"Kaibaru をご利用いただき、ありがとうございました。\n"
            f"クラブ「{subdomain}」のご利用プランは解約されました。\n\n"
            f"またのご利用をお待ちしております。\n\n"
            f"Kaibaru 運営チーム"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[owner_email],
    )



@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=60,
    retry_kwargs={"max_retries": 5},
)
def send_subscription_activated_emails(self, club_id, invoice_id):
    club = Club.objects.select_related("owner").get(id=club_id)
    owner = club.owner

    # ----------------------------
    # Admin email
    # ----------------------------
    send_mail(
        subject=f"[Kaibaru] Subscription activated ({club.subdomain})",
        message=(
            f"Club: {club.subdomain}\n"
            f"Owner: {owner.get_full_name()}\n"
            f"Email: {owner.email}\n"
            f"Invoice ID: {invoice_id}\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.SERVER_EMAIL],
    )

    # ----------------------------
    # Owner email (Japanese)
    # ----------------------------
    send_mail(
        subject="【Kaibaru】ご利用プランの有効化が完了しました",
        message=(
            f"{owner.get_full_name()} 様\n\n"
            f"Kaibaru をご利用いただきありがとうございます。\n"
            f"クラブ「{club.subdomain}」のご利用プランが有効になりました。\n\n"
            f"今後も Kaibaru をよろしくお願いいたします。\n\n"
            f"Kaibaru 運営チーム"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[owner.email],
    )



@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=30, retry_kwargs={"max_retries": 5})
def send_club_created_emails(self, club_id):
    club = Club.objects.select_related("owner").get(id=club_id)
    owner = club.owner

    send_mail(
        subject=f"[Kaibaru] New club created: {club.subdomain}",
        message=(
            f"Subdomain: {club.subdomain}\n"
            f"Owner: {owner.get_full_name()}\n"
            f"Email: {owner.email}\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.SERVER_EMAIL],
    )

    send_mail(
        subject="【Kaibaru】クラブ作成が完了しました",
        message=(
            f"{owner.get_full_name()} 様\n\n"
            f"Kaibaru にご登録いただきありがとうございます。\n"
            f"クラブ「{club.subdomain}」が作成されました。\n\n"
            f"Kaibaru 運営チーム"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[owner.email],
    )
