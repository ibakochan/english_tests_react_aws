from django.urls import path, include
from . import views
from . import viewsets
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'members', viewsets.MemberViewSet)
router.register(r'clubs', viewsets.ClubViewSet)
router.register(r'lessons', viewsets.LessonViewSet)
router.register(r'participations', viewsets.ParticipationViewSet)
router.register(r'slate_images', viewsets.SlateImageViewSet)

app_name='kaibaru'
urlpatterns = [
    path('', views.KaibaruPageView.as_view(), name='kaibaru'),
    path('api/', include(router.urls)),
    path("start_google_login/", views.start_google_login, name="start_google_login"),
]