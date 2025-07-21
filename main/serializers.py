from rest_framework import serializers
import base64
from .models import ClassroomRequest, Classroom, Test, Question, Option, Teacher, Student, MaxScore
from accounts.models import CustomUser
from .forms import ClassroomCreateForm, TestCreateForm, QuestionCreateForm, OptionCreateForm, ConnectTestForm




class MaxScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaxScore
        fields = '__all__'

class OptionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Option
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = '__all__'

    def get_options(self, obj):
        options = obj.option_set.filter(is_correct=True)
        serializer = OptionSerializer(options, many=True)
        return serializer.data

class TestNumberOfQuestions(serializers.ModelSerializer):

    class Meta:
        model = Test
        fields = ['number_of_questions']

class TestQuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    number_of_questions = serializers.IntegerField(source='test.number_of_questions', read_only=True)

    class Meta:
        model = Question
        fields = '__all__'

    def get_options(self, obj):
        options = obj.option_set.all()
        serializer = OptionSerializer(options, many=True)
        return serializer.data




class TestByClassroomSerializer(serializers.ModelSerializer):

    class Meta:
        model = Test
        fields = '__all__'

class NestedCustomUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ['username', 'id']

class StudentInClassroomsSerializer(serializers.ModelSerializer):
    user = NestedCustomUserSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = ['student_number', 'user', 'id']

class TeacherClassroomRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = ClassroomRequest
        fields = '__all__'

class ClassroomSerializer(serializers.ModelSerializer):
    students = StudentInClassroomsSerializer(many=True, read_only=True)
    requests = TeacherClassroomRequestSerializer(many=True, read_only=True)

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'students', 'character_voice', 'requests', 'battle_permission' ]

class StudentClassroomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classroom
        fields = ['id', 'name', 'battle_permission']

class StudentSerializer(serializers.ModelSerializer):
    classrooms = ClassroomSerializer(many=True, read_only=True)
    user = NestedCustomUserSerializer(read_only=True)
    class Meta:
        model = Student
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    classrooms = ClassroomSerializer(many=True, read_only=True)
    user = NestedCustomUserSerializer(read_only=True)
    class Meta:
        model = Teacher
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    teacher = TeacherSerializer(read_only=True)


    class Meta:
        model = CustomUser
        exclude = ['password', 'last_name', 'first_name']

class ClassroomRequestSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer()

    class Meta:
        model = ClassroomRequest
        fields = '__all__'


class ConnectTestFormSerializer(serializers.Serializer):
    pass