from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import MembershipPlan, MemberSubscription, Member
from .membership_serializers import MembershipPlanSerializer, MemberSubscriptionSerializer
from .tasks import cancel_stripe_subscription

class MembershipPlanViewSet(viewsets.ModelViewSet):
    serializer_class = MembershipPlanSerializer

    def get_queryset(self):
        return MembershipPlan.objects.filter(club__owner=self.request.user, active=True)

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        plan = self.get_object()
        plan.active = False
        plan.save()
        return Response({"success": True}, status=status.HTTP_200_OK)

class MemberSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSubscriptionSerializer
    queryset = MemberSubscription.objects.all()

    def get_queryset(self):
        return MemberSubscription.objects.filter(member__club__owner=self.request.user)

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        subscription = self.get_object()
        plan_id = request.data.get("plan_id")
        if not plan_id:
            return Response({"error": "plan_id required"}, status=status.HTTP_400_BAD_REQUEST)

        plan = get_object_or_404(MembershipPlan, id=plan_id, club__owner=request.user)
        subscription.plan = plan
        subscription.status = "active"
        subscription.save()
        return Response(self.get_serializer(subscription).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        subscription = self.get_object()
        if subscription.stripe_subscription_id:
            cancel_stripe_subscription.delay(subscription.stripe_subscription_id)

        subscription.status = "canceled"
        subscription.cancel_at_period_end = True
        subscription.save()
        return Response(self.get_serializer(subscription).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def status(self, request, pk=None):
        subscription = self.get_object()
        return Response(self.get_serializer(subscription).data)
