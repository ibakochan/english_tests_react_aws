from rest_framework import serializers
from .models import MembershipPlan, MemberSubscription

class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = [
            "id",
            "club",
            "name",
            "description",
            "price_cents",
            "currency",
            "interval",
            "stripe_price_id",
            "max_lessons_per_month",
            "member_category",
            "age_min",
            "age_max",
            "active",
        ]
        read_only_fields = ["id", "club"]

class MemberSubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)

    class Meta:
        model = MemberSubscription
        fields = [
            "id",
            "member",
            "plan",
            "plan_name",
            "status",
            "current_period_end",
            "cancel_at_period_end",
            "stripe_subscription_id",
        ]
        read_only_fields = ["id", "plan_name", "stripe_subscription_id"]
