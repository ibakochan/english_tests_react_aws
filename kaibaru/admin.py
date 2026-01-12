from django.contrib import admin
from .models import Member, Club, Lesson, Participation, SlateImage


 
admin.site.register([Club, Member, Lesson, Participation, SlateImage])

