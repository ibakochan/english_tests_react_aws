from rest_framework import serializers
from .models import Member, Club, Lesson, Participation, SlateImage

from google.cloud import storage

from .permissions import IsSuperuser
from django.utils import timezone

from collections import defaultdict

import json
from django.db.models import Sum
from django.db import models




class SlateImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = SlateImage
        fields = ["category", "id", "image"]

class ParticipationMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participation
        fields = ["id", "lesson", "last_participation_date"]


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
    participations = ParticipationMiniSerializer(many=True, read_only=True)
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
            "furigana",
            "phone_number",
            "emergency_number",
            "member_type",
            "contract",
            "other_information",
            "picture",
            "participations",
            "total_participation",
            "this_month_participation",
            "level_participation",
            "manual_total_participation",
            "manual_level_counts",
            "participation_limit",
            "is_kyukai",
            "is_kyukai_paid",
            "kyukai_since",
        ]
        read_only_fields = ["id", "user"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            for field in [
                "participations",
                "total_participation",
                "this_month_participation",
                "level_participation",
                "manual_total_participation",
                "manual_level_counts",
            ]:
                data.pop(field, None)
            return data

        club = getattr(instance, "club", None)
        user_member = club.members.filter(user=user).first() if club else None

        if instance.user == user:
            return data

        if user_member and (user_member.is_instructor or user_member.is_manager or club.owner_id == user.id):
            return data

        for field in [
            "participations",
            "total_participation",
            "this_month_participation",
            "level_participation",
            "manual_total_participation",
            "manual_level_counts",
        ]:
            data.pop(field, None)

        return data


    def get_total_participation(self, obj):
        return obj.manual_total_participation + sum(p.total_count for p in obj.participations.all())

    def get_this_month_participation(self, obj):
        # Just sum monthly_count, since it'll be reset automatically monthly
        return sum(p.monthly_count for p in obj.participations.all())

    def get_level_participation(self, obj):
        level_sums = defaultdict(int)

        if obj.manual_level_counts:
            for lvl, count in obj.manual_level_counts.items():
                try:
                    level_sums[int(lvl)] += int(count)
                except ValueError:
                    continue

        for p in obj.participations.all():
            if p.level_counts:
                for lvl, count in p.level_counts.items():
                    level_sums[int(lvl)] += count
        return dict(level_sums)


class LessonSerializer(serializers.ModelSerializer):
    instructor = serializers.SerializerMethodField()
    instructor_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    club = serializers.PrimaryKeyRelatedField(read_only=True)

    total_participation = serializers.SerializerMethodField()
    monthly_participation = serializers.SerializerMethodField()
    monthly_average = serializers.SerializerMethodField()


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
            "total_participation",
            "monthly_participation",
            "monthly_average",
        ]
        read_only_fields = ["id"]

    def get_instructor(self, obj):
        if obj.instructor:
            return {"id": obj.instructor.id, "full_name": obj.instructor.full_name}
        return None
    
    def get_total_participation(self, obj):
        return obj.participations.aggregate(total=Sum("total_count"))["total"] or 0

    def get_monthly_participation(self, obj):
        return obj.participations.aggregate(total=Sum("monthly_count"))["total"] or 0


    def get_monthly_average(self, obj):
        total = self.get_total_participation(obj)
        # Estimate number of days the lesson has existed
        if hasattr(obj, 'created') and obj.created:
            days = (timezone.localdate() - obj.created.date()).days
        else:
            # fallback: use 30 days if no creation date
            days = 30
        months = max(days / 30, 1)  # avoid division by zero
        return round(total / months, 2)




class ClubSerializer(serializers.ModelSerializer):
    members = MemberSerializer(many=True, read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    current_user = serializers.SerializerMethodField()
    today = serializers.SerializerMethodField()
    home_images = SlateImageSerializer(many=True, read_only=True)
    home = serializers.JSONField()
    warning_message = serializers.SerializerMethodField()
    frozen = serializers.SerializerMethodField()



    class Meta:
        model = Club
        fields = [
            "id",
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
            "favicon",           
            "og_image", 
            "current_user",
            "today",
            "home_images",
            "search_description",
            "has_levels",
            "has_attendance",
            "level_names",
            "level_milestones",
            "trial_start_date",
            "expiration_date",
            "stripe_customer_id",
            "stripe_subscription_id",
            "subscription_active",
            "warning_message",
            "frozen",
        ]
        read_only_fields = ["id"]

    def get_frozen(self, club):  
        if not club.expiration_date:
            return False

        today = timezone.localdate()

        days_after_exp = max((today - club.expiration_date).days, 0)
        
 

        if not club.stripe_subscription_id:
            return days_after_exp >= 1

        return 7 < days_after_exp <= 28

    def get_warning_message(self, club):
        if not club.expiration_date:
            return None

        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        today = timezone.localdate()

        days_after_exp = max((today - club.expiration_date).days, 0)

 

        # DELETE after 28 days (view will delete object)
        if not club.stripe_subscription_id and days_after_exp >= 7:
            return None

        if club.stripe_subscription_id and days_after_exp > 28:
            return None
        
        if not club.stripe_subscription_id:
            if request.user != club.owner:
                return None

            if days_after_exp == 0:
                return (
                    "このクラブはまだサブスクリプションに登録されていません。"
                    "本日中に支払いが完了しない場合、明日からクラブは凍結され、"
                    "編集や他のユーザーからの閲覧ができなくなります。"
                )
    
            # Day 1+: frozen message
            if days_after_exp >= 1:
                days_left = max(0, 7 - days_after_exp)
                return (
                    "このクラブは現在凍結されています。"
                    "サブスクリプションが未登録のため、編集および表示が制限されています。"
                    f"あと {days_left} 日以内に支払いが完了しない場合、"
                    "クラブと所属メンバーのデータは完全に削除されます。"
                )
    
            return None
    
        # FROZEN (7–28 days)
        if 7 < days_after_exp <= 28:
            if request.user != club.owner:
                return None
            days_left = 28 - days_after_exp
            return (
                f"このクラブは現在凍結されています。編集はできず、"
                f"オーナー以外のユーザーには表示されません。"
                f"あと {days_left} 日以内に支払いが完了しない場合、"
                f"クラブとその所属メンバーのデータは完全に削除されます。"
            )

        # WARNING (0–7 days)
        if 1 <= days_after_exp <= 7:
            if request.user == club.owner:
                days_left = 7 - days_after_exp
                days_left_till_delete = 28 - days_after_exp
                return (
                    f"クラブの有効期限が切れています。このまま支払いがない場合、"
                    f"あと {days_left} 日で編集できなくなり、他の人からも見えなくなります。"
                    f"その後 {days_left_till_delete} 日以内に支払いがない場合、クラブと所属メンバーの情報は完全に削除されます。"
                )

        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            members_qs = instance.members.filter(
                models.Q(is_instructor=True) |
                models.Q(is_manager=True) |
                models.Q(user=instance.owner)
            )
            data["members"] = MemberSerializer(members_qs, many=True, context=self.context).data
            return data

        user = request.user
        
        if instance.owner_id == user.id:
            return data

        user_member = instance.members.filter(user=user).first()

        if user_member and (user_member.is_instructor or user_member.is_manager):
            return data

        data["members"] = list(instance.members.filter(
            models.Q(is_instructor=True) | 
            models.Q(is_manager=True) | 
            models.Q(user=instance.owner) |
            models.Q(user=user)
        ))
        data["members"] = MemberSerializer(data["members"], many=True, context=self.context).data

        return data



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