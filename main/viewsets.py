from django.views import View
from accounts.models import CustomUser
from .models import Classroom, Test, Question, Option, Teacher, Student, MaxScore, ClassroomRequest
from random import shuffle
from rest_framework import viewsets
from rest_framework.decorators import action
from .profile_assets import get_profile_assets, get_memories, get_total_questions, get_total_category_scores, get_eiken_pet, get_eiken_memories
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from .serializers import (ClassroomSerializer, TestQuestionSerializer, OptionSerializer,
                          CustomUserSerializer, TestByClassroomSerializer, ClassroomRequestSerializer, MaxScoreSerializer)

class IsSuperuser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class ClassroomRequestViewSet(viewsets.ModelViewSet):
    queryset = ClassroomRequest.objects.all()
    serializer_class = ClassroomRequestSerializer

    def get_permissions(self):
        if self.action in ['get_classroomrequest_by_classroom']:
            return [permission() for permission in self.permission_classes]
        return [IsSuperuser()]

    @action(detail=False, methods=['get'], url_path='by-classroom/(?P<classroom_id>[^/.]+)')
    def get_classroomrequest_by_classroom(self, request, classroom_id=None):

        
        classroom = Classroom.objects.get(id=classroom_id)
        teacher = request.user.teacher
        
        if ClassroomRequest.objects.filter(teacher=teacher, classroom=classroom, unchangeable=True).exists():

            classroomrequest_ids = ClassroomRequest.objects.filter(classroom_id=classroom_id).values_list('id', flat=True).distinct()

            classroomrequest = ClassroomRequest.objects.filter(id__in=classroomrequest_ids, unchangeable=False)

            serializer = ClassroomRequestSerializer(classroomrequest, many=True)

            return Response(serializer.data)

class MaxScoreViewSet(viewsets.ModelViewSet):
    queryset = MaxScore.objects.all()
    serializer_class = MaxScoreSerializer

    @action(detail=False, methods=['get'], url_path='by-user/(?P<user_id>[^/.]+)')
    def get_maxscore_by_user(self, request, user_id=None):

        maxscore_ids = MaxScore.objects.filter(user_id=user_id).values_list('id', flat=True).distinct()

        maxscore = MaxScore.objects.filter(id__in=maxscore_ids)

        serializer = MaxScoreSerializer(maxscore, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-category-and-user/(?P<category>[^/.]+)/(?P<user_id>[^/.]+)')
    def get_maxscore_by_category_and_user(self, request, category=None, user_id=None):
        tests = Test.objects.filter(category=category)

        maxscore_ids = MaxScore.objects.filter(test__in=tests, user_id=user_id).values_list('id', flat=True).distinct()

        maxscore = MaxScore.objects.filter(id__in=maxscore_ids)

        serializer = MaxScoreSerializer(maxscore, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-classroom_and_test/(?P<test_id>[^/.]+)')
    def get_maxscore_by_classroom_and_test(self, request, test_id=None):
        user = request.user
        teacher = Teacher.objects.get(user=user)
        classrooms = Classroom.objects.filter(teacher=teacher)

        users = []

        for classroom in classrooms:
            students = classroom.students.all()
            users.extend([student.user for student in students])
        maxscores = MaxScore.objects.filter(user__in=users, test_id=test_id)

        serializer = MaxScoreSerializer(maxscores, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-test/(?P<test_id>[^/.]+)')
    def get_maxscore_by_test(self, request, test_id=None):
        maxscores = MaxScore.objects.filter(test_id=test_id, user_id=request.user.id)

        serializer = MaxScoreSerializer(maxscores, many=True)

        return Response(serializer.data)









class TestQuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = TestQuestionSerializer

    @action(detail=False, methods=['get'], url_path='by-category/(?P<category>[^/.]+)')
    def get_questions_by_category(self, request, category=None):
        tests = Test.objects.filter(category=category)
        questions = Question.objects.filter(test__in=tests)
        questions = list(questions)
        shuffle(questions)
        serializer = TestQuestionSerializer(questions, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-test/(?P<test_id>[^/.]+)')
    def get_questions_by_test(self, request, test_id=None):
        questions = Question.objects.filter(test__id=test_id)
        questions = list(questions)
        shuffle(questions)
        serializer = TestQuestionSerializer(questions, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='one-question/(?P<test_id>[^/.]+)')
    def get_one_question_by_test(self, request, test_id=None):
        question = Question.objects.filter(test__id=test_id).order_by('id').first()

        if question:
            serializer = TestQuestionSerializer(question)
            return Response(serializer.data)
        else:
            return Response({"detail": "No questions found for this test"}, status=404)

class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer

    @action(detail=False, methods=['get'], url_path='by-question/(?P<question_id>[^/.]+)')
    def get_options_by_question(self, request, question_id=None):
        options = Option.objects.filter(question__id=question_id)
        options = list(options)
        shuffle(options)

        serializer = OptionSerializer(options, many=True)

        return Response(serializer.data)

class NameIdTestViewSet(viewsets.ModelViewSet):
    queryset = Test.objects.all()
    serializer_class = TestByClassroomSerializer

    @action(detail=False, methods=['get'], url_path='by-classroom/(?P<classroom_id>[^/.]+)')
    def by_classroom(self, request, classroom_id=None):
        tests = self.queryset.filter(classroom__id=classroom_id)
        serializer = self.get_serializer(tests, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-category')
    def by_category(self, request):
        categories = request.query_params.getlist('category')
        valid_categories = ['japanese', 'english_5', 'english_6', 'jr_1', 'phonics', 'numbers', 'eiken', 'eiken4', 'eiken3', 'eiken_pre2', 'eiken2']

        if any(category in valid_categories for category in categories):
            tests = self.queryset.filter(category__in=categories)
            serializer = self.get_serializer(tests, many=True)
            return Response(serializer.data)
        return Response({"error": "Invalid or unspecified categories"}, status=400)


class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer

    def get_permissions(self):
        if self.action in ['get_my_classroom', 'get_my_classroom_teacher']:
            return [permission() for permission in self.permission_classes]
        return [IsSuperuser()]

    @action(detail=False, methods=['get'], url_path='my-classroom')
    def get_my_classroom(self, request):
        user = request.user
        try:
            student = Student.objects.get(user=user)
            classrooms = Classroom.objects.filter(students=student)
            if classrooms.exists():
                serializer = self.get_serializer(classrooms, many=True)
                return Response(serializer.data)
            else:
                return Response({"detail": "Student is not enrolled in any classroom"}, status=404)
        except Student.DoesNotExist:
            try:
                teacher = Teacher.objects.get(user=user)
                classrooms = Classroom.objects.filter(teacher=teacher)
                if classrooms.exists():
                    serializer = self.get_serializer(classrooms, many=True)
                    return Response(serializer.data)
                else:
                    return Response({"detail": "Teacher is not assigned to any classroom"}, status=404)
            except Teacher.DoesNotExist:
                return Response({"detail": "User is not associated with any student or teacher"}, status=404)

    @action(detail=False, methods=['get'], url_path='my-classroom-teacher')
    def get_my_classroom_teacher(self, request):
        user = request.user
        try:
            teacher = Teacher.objects.get(user=user)
            classrooms = Classroom.objects.filter(teacher=teacher)
            if classrooms.exists():
                serializer = self.get_serializer(classrooms, many=True)
                return Response(serializer.data)
            else:
                return Response({"detail": "Teacher is not assigned to any classroom"}, status=404)
        except Teacher.DoesNotExist:
            return Response({"detail": "User is not a teacher"}, status=404)







class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    def get_permissions(self):
        if self.action in ['get_current_user_with_asset', 'get_users_by_classroom']:
            return [permission() for permission in self.permission_classes]
        return [IsSuperuser()]



    @action(detail=False, methods=['get'], url_path='by-classroom/(?P<classroom_id>[^/.]+)')
    def get_users_by_classroom(self, request, classroom_id=None):
        user = request.user
        if Student.objects.filter(user=user).exists():
            users = CustomUser.objects.filter(id=user.id)
        else:
            teacher = Teacher.objects.filter(user=user).first()
            if teacher and Classroom.objects.filter(teacher=teacher, id=classroom_id).exists():
                students = Student.objects.filter(classrooms__id=classroom_id)
                user_ids = students.values_list('user_id', flat=True)
                users = CustomUser.objects.filter(id__in=user_ids)
            else:
                users = CustomUser.objects.none()

        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=['get'], url_path='current-user')
    def get_current_user_with_asset(self, request):
        user = request.user
        question_counts = get_total_questions()
        total_category_scores = get_total_category_scores(user)
        total_max_scores = user.total_max_scores
        total_eiken_scores = user.total_eiken_score + user.total_4eiken_score + user.total_numbers_score + user.total_phonics_score
        memories = get_memories(total_max_scores)
        asset = get_profile_assets(total_max_scores)
        pets = get_eiken_pet(total_eiken_scores)
        eiken_memories = get_eiken_memories(total_eiken_scores)
        user_data = self.get_serializer(user).data
        user_data['question_counts'] = question_counts
        user_data['profile_asset'] = asset
        user_data['memories'] = memories
        user_data['pets'] = pets
        user_data['eiken_memories'] = eiken_memories
        user_data['total_category_scores'] = total_category_scores

        return Response(user_data)
