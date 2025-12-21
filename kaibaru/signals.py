from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Club
from .tasks_emails import send_club_created_emails

 

@receiver(post_save, sender=Club)
def club_created_signal(sender, instance, created, **kwargs):
    if kwargs.get("raw", False):
        return

    if not created:
        return

    send_club_created_emails.delay(instance.id)

