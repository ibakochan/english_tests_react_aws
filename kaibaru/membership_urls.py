from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import membership_viewsets
from . import membership_views

app_name = "membership"

router = DefaultRouter()
router.register(r'plans', membership_viewsets.MembershipPlanViewSet, basename='plan')
router.register(r'subscriptions', membership_viewsets.MemberSubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('api/', include(router.urls)),

    path(
        'create_member_checkout_session/<int:member_id>/',
        membership_views.create_member_checkout_session,
        name='create_member_checkout_session'
    ),
    path(
        'member_stripe_webhook/',
        membership_views.member_stripe_webhook,
        name='member_stripe_webhook'
    ),
]
