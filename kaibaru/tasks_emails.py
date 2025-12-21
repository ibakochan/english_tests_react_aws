from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from .models import Club


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
