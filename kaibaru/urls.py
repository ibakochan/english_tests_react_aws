from django.urls import re_path, path, include
from . import views
from . import viewsets
from rest_framework.routers import DefaultRouter
from django.contrib.sitemaps.views import sitemap, index
from .sitemaps import ClubSitemap

sitemaps = {
    'clubs': ClubSitemap,
}

router = DefaultRouter()
router.register(r'members', viewsets.MemberViewSet)
router.register(r'clubs', viewsets.ClubViewSet)
router.register(r'lessons', viewsets.LessonViewSet)
router.register(r'participations', viewsets.ParticipationViewSet)
router.register(r'slate_images', viewsets.SlateImageViewSet)

app_name='kaibaru'
urlpatterns = [
    path('', views.KaibaruPageView.as_view(), name='kaibaru'),
    path('system/', views.KaibaruPageView.as_view(), name='system'),
    path('schedule/', views.KaibaruPageView.as_view(), name='schedule'),
    path('trial/', views.KaibaruPageView.as_view(), name='trial'),
    path('member/', views.KaibaruPageView.as_view(), name='member'),
    path('contact/', views.KaibaruPageView.as_view(), name='contact'),
    path('teacher/', views.KaibaruPageView.as_view(), name='teacher'),
    path('settings/', views.KaibaruPageView.as_view(), name='settings'),
    path('join/', views.KaibaruPageView.as_view(), name='join'),
    path('api/', include(router.urls)),
    path("start_google_login/", views.start_google_login, name="start_google_login"),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    path('create_checkout_session/<int:club_id>/', views.create_checkout_session, name='create_checkout_session'),
    path('stripe_webhook/', views.stripe_webhook, name='stripe_webhook'),
    path('unsubscribe/<int:club_id>/', views.unsubscribe, name='unsubscribe'),
    path('membership/', include('kaibaru.membership_urls', namespace='membership')),
]