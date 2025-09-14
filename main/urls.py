from django.urls import path, include
from . import views
from . import viewsets
from django.contrib.auth.decorators import user_passes_test
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'classrooms', viewsets.ClassroomViewSet)
router.register(r'name-id-tests', viewsets.NameIdTestViewSet)
router.register(r'test-questions', viewsets.TestQuestionViewSet, basename='test-questions')
router.register(r'options', viewsets.OptionViewSet)
router.register(r'users', viewsets.CustomUserViewSet)
router.register(r'maxscore', viewsets.MaxScoreViewSet)
router.register(r'classroomrequest', viewsets.ClassroomRequestViewSet)
router.register(r'vocab-data', viewsets.EikenVocabDataViewSet, basename='vocab-data')



def is_superuser(user):
    return user.is_superuser


app_name='main'
urlpatterns = [
    path('api/', include(router.urls)),
    path('choose-role/', views.StudentTeacherChooseView.as_view(), name='choose_role'),
    path('', views.ProfilePageView.as_view(), name='profile'),
    path('ar/', views.ProfilePageView.as_view(), name='profile_ar'),
    path('portfolio/', views.PortfolioView.as_view(), name='portfolio'),
    path('classrooms/<int:id>/toggle-battle/', views.ToggleBattlePermissionView.as_view(), name='toggle-battle-permission'),
    path('classrooms/<int:id>/toggle-character-voice/', views.ToggleCharacterVoiceView.as_view(), name='toggle-character-voice'),
    path('classroom_accept/<int:pk>/', views.ClassroomAcceptView.as_view(), name='classroom_accept'),
    path('join_classroom/', views.ClassroomJoinView.as_view(), name='join_classroom'),
    path('update/profile/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('remove/account/<int:pk>/', views.AccountRemoveView.as_view(), name='delete_account'),
    path('classroom/create/', views.ClassroomCreateView.as_view(), name='classroom_create'),
    path('test/create/', views.TestCreateView.as_view(), name='test_create'),
    path('test/<int:pk>/delete/', views.TestDeleteView.as_view(), name='test_delete'),
    path('question/<int:pk>/create/', views.QuestionCreateView.as_view(), name='question_create'),
    path('option/<int:pk>/create/', views.OptionCreateView.as_view(), name='option_create'),
    path('score/<int:pk>/record/', views.ScoreRecordView.as_view(), name='record_score'),
    path('final/<str:category>/score/', views.FinalScoreView.as_view(), name='final_score'),
    path('question/<int:pk>/delete/', views.QuestionDeleteView.as_view(), name='question_delete'),
    path('option/<int:pk>/delete/', views.OptionDeleteView.as_view(), name='option_delete'),
    path('character_silence/', views.ClassroomSilenceView.as_view(), name='character_voice'),
]