from django.contrib import admin
from .models import Member, Club, Lesson, Participation, SlateImage

# Register your models here.
admin.site.register([Member, Club, Lesson, Participation, SlateImage])