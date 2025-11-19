from rest_framework import serializers
from .models import Member, Club, Lesson, Participation, SlateImage

from google.cloud import storage
from datetime import timedelta

from .permissions import IsSuperuser
from django.utils import timezone

from collections import defaultdict

import json

class SlateImageSerializer(serializers.ModelSerializer):
    picture_url = serializers.SerializerMethodField()

    class Meta:
        model = SlateImage
        fields = ["category", "id", "image", "picture_url"]

    def get_picture_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

class ParticipationSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = Participation
        fields = [
            "id",
            "member",
            "lesson",
            "total_count",
            "monthly_count",
            "level_counts",
            "last_participation_date",
            "second_last_participation_date",
            "member_name",
            "lesson_title",
        ]
        read_only_fields = ["id", "member_name", "lesson_title"]



class MemberSerializer(serializers.ModelSerializer):
    picture_url = serializers.SerializerMethodField()
    participations = ParticipationSerializer(many=True, read_only=True)
    total_participation = serializers.SerializerMethodField()
    this_month_participation = serializers.SerializerMethodField()
    level_participation = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            "id",
            "level",
            "user",
            "is_instructor",
            "is_manager",
            "introduction",
            "full_name",
            "phone_number",
            "emergency_number",
            "member_type",
            "contract",
            "other_information",
            "picture",
            "picture_url",
            "participations",
            "total_participation",
            "this_month_participation",
            "level_participation",
        ]
        read_only_fields = ["id", "user"]

    def get_picture_url(self, obj):
        request = self.context.get("request")
        if obj.picture and hasattr(obj.picture, "url"):
            return request.build_absolute_uri(obj.picture.url) if request else obj.picture.url
        return None

    def get_total_participation(self, obj):
        return sum(p.total_count for p in obj.participations.all())

    def get_this_month_participation(self, obj):
        # Just sum monthly_count, since it'll be reset automatically monthly
        return sum(p.monthly_count for p in obj.participations.all())

    def get_level_participation(self, obj):
        level_sums = defaultdict(int)
        for p in obj.participations.all():
            if p.level_counts:
                for lvl, count in p.level_counts.items():
                    level_sums[int(lvl)] += count
        return dict(level_sums)


class LessonSerializer(serializers.ModelSerializer):
    picture_url = serializers.SerializerMethodField()
    instructor = MemberSerializer(read_only=True)
    instructor_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    club = serializers.PrimaryKeyRelatedField(read_only=True)


    class Meta:
        model = Lesson
        fields = [
            "id",
            "club",
            "instructor",
            "instructor_id",
            "title",
            "weekday",
            "start_time",
            "end_time",
            "description",
            "picture",
            "picture_url",
        ]
        read_only_fields = ["id"]

    def get_picture_url(self, obj):
        request = self.context.get("request")
        if obj.picture and hasattr(obj.picture, "url"):
            return request.build_absolute_uri(obj.picture.url) if request else obj.picture.url
        return None


class ClubSerializer(serializers.ModelSerializer):
    picture_url = serializers.SerializerMethodField()
    members = MemberSerializer(many=True, read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    current_user = serializers.SerializerMethodField()
    today = serializers.SerializerMethodField()
    home_images = SlateImageSerializer(many=True, read_only=True)
    home = serializers.JSONField()


    class Meta:
        model = Club
        fields = [
            "id",
            "name",
            "owner",
            "title",
            "subdomain",
            "members",
            "lessons",
            "home",
            "system",
            "trial",
            "contact",
            "facebook_url",    
            "instagram_url",   
            "line_url",
            "line_qr_code",
            "picture",
            "picture_url",
            "favicon",           
            "og_image", 
            "current_user",
            "today",
            "home_images",
            "search_description",
        ]
        read_only_fields = ["id"]

    def get_picture_url(self, obj):
        if obj.picture and hasattr(obj.picture, "url"):
            return obj.picture.url
        return None



    def get_current_user(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            }
        return None

    def get_today(self, obj):
        return timezone.localdate().isoformat()