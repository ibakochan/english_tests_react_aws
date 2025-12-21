from django.db import models
from accounts.models import CustomUser
from django.utils import timezone
from .storage_backends import PrivateMediaStorage
from django.utils import timezone
import datetime

def club_folder_upload_to(subfolder=None):

    def upload(instance, filename):
        club_subdomain = getattr(instance.club, "subdomain", "unknown_club")
        if subfolder:
            return f"{club_subdomain}/{subfolder}/{filename}"
        return f"{club_subdomain}/{filename}"
    return upload

def club_picture_upload_to(instance, filename):
    return f"{instance.subdomain}/{filename}"

def line_qr_upload_to(instance, filename):
    club_subdomain = getattr(instance, "subdomain", "unknown_club")
    return f"{club_subdomain}/line/{filename}"

def club_slate_image_upload_to(instance, filename):
    club_subdomain = getattr(instance.club, "subdomain", "unknown_club")
    category = getattr(instance, "category", "home")  # fallback to home
    return f"{club_subdomain}/{category}/{filename}"

def club_lessons_upload_to(instance, filename):
    return club_folder_upload_to("lessons")(instance, filename)

def club_member_pictures_upload_to(instance, filename):
    return club_folder_upload_to("members")(instance, filename)

def club_favicon_upload_to(instance, filename):
    club_subdomain = getattr(instance, "subdomain", "unknown_club")
    return f"{club_subdomain}/favicon/{filename}"

def club_og_image_upload_to(instance, filename):
    club_subdomain = getattr(instance, "subdomain", "unknown_club")
    return f"{club_subdomain}/og/{filename}"

class Club(models.Model):
    subdomain = models.SlugField(max_length=50, unique=True, null=True, blank=True)

    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="owned_clubs")

    trial_start_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=255, null=True, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, null=True, blank=True)
    subscription_active = models.BooleanField(default=False)
    last_paid_invoice_id = models.CharField(max_length=255, blank=True, null=True)


    system = models.JSONField(null=True, blank=True)
    trial = models.JSONField(null=True, blank=True)
    contact = models.JSONField(null=True, blank=True)
    home = models.JSONField(null=True, blank=True)


    picture = models.ImageField(upload_to=club_picture_upload_to, null=True, blank=True)

    search_description = models.TextField(null=True, blank=True)
    title = models.CharField(max_length=200, null=True, blank=True)  
    favicon = models.ImageField(upload_to=club_favicon_upload_to, null=True, blank=True)
    og_image = models.ImageField(upload_to=club_og_image_upload_to, null=True, blank=True)


    facebook_url = models.URLField(null=True, blank=True)
    instagram_url = models.URLField(null=True, blank=True)
    line_url = models.URLField(null=True, blank=True)
    line_qr_code = models.ImageField(upload_to=line_qr_upload_to, null=True, blank=True)

    join_key = models.CharField(max_length=50, null=True, blank=True)

    has_levels = models.BooleanField(default=False)
    has_attendance = models.BooleanField(default=False)
    
    level_names = models.JSONField(null=True, blank=True)
    
    level_milestones = models.JSONField(null=True, blank=True)

    last_reset = models.DateField(null=True, blank=True)


    def __str__(self):
        return self.subdomain

class SlateImage(models.Model):
    CATEGORY_CHOICES = [
        ("home", "Home"),
        ("trial", "Trial"),
        ("system", "System"),
        ("contact", "Contact"),
    ]
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="slate_images")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="home")
    image = models.ImageField(upload_to=club_slate_image_upload_to)

    def __str__(self):
        return f"{self.club.subdomain} - Image {self.id}"

class Member(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="memberships")
    club = models.ForeignKey("Club", on_delete=models.CASCADE, null=True, blank=True, related_name="members")

    is_instructor = models.BooleanField(default=False)  # Marks if this member is also an instructor
    is_manager = models.BooleanField(default=False)
    introduction = models.TextField(null=True, blank=True)  # Only used if instructor

    full_name = models.CharField(max_length=200)
    furigana = models.CharField(max_length=200, default="")
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    emergency_number = models.CharField(max_length=20, null=True, blank=True)
    
    member_type = models.TextField(null=True, blank=True)  
    contract = models.TextField(null=True, blank=True)

    other_information = models.TextField(null=True, blank=True)

    picture = models.ImageField(upload_to=club_member_pictures_upload_to, null=True, blank=True)

    level = models.PositiveIntegerField(default=1)

    manual_total_participation = models.IntegerField(default=0)
    manual_level_counts = models.JSONField(default=dict)

    participation_limit = models.PositiveIntegerField(null=True, blank=True, default=None)

    is_kyukai = models.BooleanField(default=False)
    is_kyukai_paid = models.BooleanField(default=False)
    kyukai_since = models.DateField(null=True, blank=True)


    class Meta:
        unique_together = ('user', 'club')  

    def __str__(self):
        return f"{self.full_name} ({self.club.subdomain})"

class Lesson(models.Model):
    club = models.ForeignKey('Club', on_delete=models.CASCADE, related_name='lessons')
    instructor = models.ForeignKey('Member', on_delete=models.SET_NULL, null=True, blank=True,
                                   limit_choices_to={'is_instructor': True})
    title = models.CharField(max_length=200, blank=True)

    weekday = models.IntegerField(choices=[(0,"月曜日"),(1,"火曜日"),(2,"水曜日"),
                                           (3,"木曜日"),(4,"金曜日"),(5,"土曜日"),(6,"日曜日")])
    start_time = models.TimeField()
    end_time = models.TimeField()

    description = models.TextField(null=True, blank=True)

    picture = models.ImageField(upload_to=club_lessons_upload_to, null=True, blank=True)

    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.club.subdomain} - {self.get_weekday_display()} {self.start_time.strftime('%H:%M')}"

class Participation(models.Model):
    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='participations')
    lesson = models.ForeignKey('Lesson', on_delete=models.SET_NULL, null=True, blank=True, related_name='participations')
    
    total_count = models.PositiveIntegerField(default=0)
    monthly_count = models.PositiveIntegerField(default=0)
    level_counts = models.JSONField(default=dict)
    last_participation_date = models.DateField(null=True, blank=True)
    second_last_participation_date = models.DateField(null=True, blank=True)
    
    class Meta:
        unique_together = ('member', 'lesson')  # one row per member per lesson

    def __str__(self):
        lesson_title = self.lesson.title if self.lesson else "Deleted Lesson"
        return f"{self.member.full_name} - {lesson_title}"