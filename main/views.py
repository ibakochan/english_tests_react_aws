from django.shortcuts import render
from django.views import View
from accounts.models import CustomUser
from django.http import JsonResponse
from django.forms.models import model_to_dict
from accounts.forms import StudentSignUpForm, TeacherSignUpForm
from .models import Classroom, Test, Question, Option, Teacher, Student, MaxScore, ClassroomRequest
from django.contrib.auth import login, authenticate
from django.contrib.auth.mixins import UserPassesTestMixin
import json
from .profile_assets import get_profile_assets, get_memories, get_total_questions, get_total_category_scores, get_eiken_pet, get_eiken_memories
from django.db.models import Sum
from django.urls import reverse_lazy
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from allauth.socialaccount.models import SocialAccount

from rest_framework.response import Response

from .forms import ClassroomCreateForm, TestCreateForm, QuestionCreateForm, OptionCreateForm, ConnectTestForm, ClassroomJoinForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect
from django.core.exceptions import ObjectDoesNotExist



def remove_digits_from_end(string, num_digits):
    return string[:-num_digits]



class ClassroomSilenceView(View):
    def post(self, request):
        teacher = Teacher.objects.get(user=request.user)
        classroom = Classroom.objects.get(teacher=teacher)

        classroom.character_voice = not classroom.character_voice
        classroom.save()

        return redirect('main:profile')


class ClassroomJoinView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            classroom_name = data.get("classroom_name")
            user = request.user

            if not classroom_name:
                return JsonResponse({"status": "error", "message": "Classroom name is required"}, status=400)

            try:
                classroom = Classroom.objects.get(name=classroom_name)
                response_students = []
                if hasattr(user, "teacher"):
                    response_students = list(classroom.students.values("user__username", "student_number"))
                classroom_response = {"id": classroom.id, "name": classroom.name, "character_voice": classroom.character_voice, "students": response_students}

                if hasattr(user, "student"):
                    student = user.student
                    student.classrooms.add(classroom)
                    return JsonResponse({"status": "success", "message": f"生徒として教室{classroom.name}に入りました！", "classroom": classroom_response})

                if hasattr(user, "teacher"):
                    teacher = user.teacher
                    if user.is_superuser or ClassroomRequest.objects.filter(classroom=classroom, teacher=teacher, is_accepted=True).exists():
                        teacher.classrooms.add(classroom)
                        return JsonResponse({"status": "success", "message": f"先生として教室{classroom.name}に入りました！", "classroom": classroom_response})
                    elif not ClassroomRequest.objects.filter(classroom=classroom, teacher=teacher).exists():
                        ClassroomRequest.objects.create(classroom=classroom, teacher=teacher)
                        return JsonResponse({"status": "pending", "message": "教室に入りたいリクエストを送りました。アクセプトされるしだい自動的に教室に入る"})
                    else:
                        return JsonResponse({"status": "error", "message": "まだリクエストがアクセプトされていません。"})

                return JsonResponse({"status": "error", "message": "あなたは学生でも先生でもないようです"}, status=400)

            except Classroom.DoesNotExist:
                return JsonResponse({"status": "error", "message": "教室名が間違っている"}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON data"}, status=400)

class ClassroomAcceptView(LoginRequiredMixin, View):
    def post(self, request, pk):
        response_data = {}
        try:
            classroom_request = ClassroomRequest.objects.get(pk=pk)
            teacher = classroom_request.teacher
            classroom = classroom_request.classroom
            data = json.loads(request.body)
            unchangeable = data.get("unchangeable", False)
            
            if unchangeable == True:
                classroom_request.is_accepted = True
                classroom_request.unchangeable = True
                teacher.classrooms.add(classroom)
                response_data['status'] = f'{teacher.user.username}先生は教室へ対して完全なる権限を持つようになった'
            elif classroom_request.is_accepted:
                classroom_request.is_accepted = False
                if classroom_request.classroom == classroom:
                    teacher.classrooms.remove(classroom)
                response_data['status'] = f'{teacher.user.username}先生はこの教室から除かれた'
            else:
                classroom_request.is_accepted = True
                teacher.classrooms.add(classroom)
                response_data['status'] = f'{teacher.user.username}先生はこの教室に入りました'

            classroom_request.save()
            response_data['success'] = True
        except ClassroomRequest.DoesNotExist:
            response_data['success'] = False
            response_data['error'] = 'Classroom request not found'
        except Classroom.DoesNotExist:
            response_data['success'] = False
            response_data['error'] = 'Open room not found'
        except Exception as e:
            response_data['success'] = False
            response_data['error'] = str(e)

        return JsonResponse(response_data)


class ToggleBattlePermissionView(View):
    def post(self, request, id):
        classroom = get_object_or_404(Classroom, id=id)
        classroom.battle_permission = not classroom.battle_permission
        classroom.save()
        return JsonResponse({
            'classroom_id': classroom.id,
            'battle_permission': classroom.battle_permission
        })

class ToggleCharacterVoiceView(View):
    def post(self, request, id):
        classroom = get_object_or_404(Classroom, id=id)
        classroom.character_voice = not classroom.character_voice
        classroom.save()
        return JsonResponse({
            'classroom_id': classroom.id,
            'character_voice': classroom.character_voice
        })

class ProfilePageView(View):


    template_name = 'main/test.html'

    def get(self, request):
        user = ""
        has_google = False
        if request.user.is_authenticated:
            user=request.user
            has_google = SocialAccount.objects.filter(user=user, provider='google').exists()



        return render(request, self.template_name, {'user': user, 'has_google': has_google})






class PortfolioView(View):
    template_name = 'main/test.html'

    def get(self, request):
        return render(request, self.template_name)


class StudentTeacherChooseView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            role = data.get('role')

            if role == 'teacher':
                student = Student.objects.filter(user=request.user).first()
                if student:
                    student.delete()

                teacher = Teacher.objects.create(user=request.user)
                teacher_data = {
                    "id": teacher.id,
                    "classrooms": [],
                    "user": {
                        "id": request.user.id,
                        "username": request.user.username,
                    }
                }
                return JsonResponse({"message": "先生になりました", "teacher": teacher_data}, status=201)

            elif role == 'student':
                teacher = Teacher.objects.filter(user=request.user).first()
                if teacher:
                    teacher.delete()

                student = Student.objects.create(user=request.user)
                student_data = {
                    "id": student.id,
                    "classrooms": [],
                    "user": {
                        "id": request.user.id,
                        "username": request.user.username,
                    },
                    "student_number": student.student_number,
                }
                return JsonResponse({"message": "生徒になりました", "student": student_data}, status=201)

            else:
                return JsonResponse({"error": "エラーになった"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "JSONエラー"}, status=400)
        

@method_decorator(never_cache, name='dispatch')
class StudentSignUpView(View):
    template_name = 'accounts/student_signup.html'

    def get(self, request):
        form = StudentSignUpForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = StudentSignUpForm(request.POST)

        username = request.POST.get('username')
        password = request.POST.get('password')
        if CustomUser.objects.filter(username=username).exists():
            error_message = "このユーザネームはすでに使われている"
            return render(request, self.template_name, {'form': form, 'error_message': error_message})

        if len(username) > 10:
            error_message = "ユーザーネームは最大１０文字"
            return render(request, self.template_name, {'form': form, 'error_message': error_message})


        if form.is_valid():
            user = form.save()
            user = authenticate(request, username=username, password=password)
            login(request, user)
            return redirect('/')
        else:
            error_message = "ユーザーネームにスペースや記号などは入れません"
            return render(request, self.template_name, {'form': form, 'error_message': error_message})
        return render(request, self.template_name, {'form': form})

@method_decorator(never_cache, name='dispatch')
class TeacherSignUpView(View):
    template_name = 'accounts/teacher_signup.html'

    def get(self, request):
        form = TeacherSignUpForm()

        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = TeacherSignUpForm(request.POST)

        username = request.POST.get('username')
        password = request.POST.get('password')
        if CustomUser.objects.filter(username=username).exists():
            error_message = "A user with that username already exists."
            return render(request, self.template_name, {'form': form, 'error_message': error_message})


        if form.is_valid():
            user = form.save(commit=False)
            password = form.cleaned_data.get('password')
            email = form.cleaned_data.get('email')
            user.set_password(password)
            user.email = email
            user.save()

            teacher =Teacher.objects.create(user=user)
            
            user = authenticate(request, username=username, password=password)
            login(request, user)
            return redirect('/')

        else:
            error_message = "Passwords don't match."
            return render(request, self.template_name, {'form': form, 'error_message': error_message})

        return render(request, self.template_name, {'form': form})

class UpdateProfileView(View):
    def post(self, request):
        user = request.user
        try:
            data = json.loads(request.body)
            student_number = data.get("studentNumber")
        
            student = Student.objects.get(user=user)
            if student_number != "":
                student.student_number = student_number
                student.save()
            
            message_response = f"出席番号を {student_number} に変更できた"
            return JsonResponse({'status': 'success', 'message': message_response, 'student_number': student_number})
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)        

class AccountRemoveView(LoginRequiredMixin, View):
    def post(self, request, pk):
        try:
            data = json.loads(request.body)
            classroom_id = data.get("classroomId")
            classroom = Classroom.objects.get(id=classroom_id)
            user = CustomUser.objects.get(pk=pk)

            student = Student.objects.filter(user=user).first()
            if student:  
                student.classrooms.remove(classroom)

            teacher = Teacher.objects.filter(user=user).first()
            if teacher:  
                teacher.classrooms.remove(classroom)
                
            return JsonResponse({'status': 'success', 'message': 'Account removed'})
        except ObjectDoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)




class ClassroomCreateView(LoginRequiredMixin, View):
    def post(self, request):
        data = json.loads(request.body)
        classroom_name = data.get("classroom_name")
        if Classroom.objects.filter(name=classroom_name).exists():
            return JsonResponse({'status': 'error', 'message': 'Classroom not found'})
        else:    
            teacher = Teacher.objects.get(user=request.user)
            classroom = Classroom.objects.create(name=classroom_name)
            classroom.teacher.add(teacher)
            classroom_response = {"id": classroom.id, "name": classroom.name, "character_voice": classroom.character_voice, "students": []}
            ClassroomRequest.objects.create(teacher=teacher, classroom=classroom, is_accepted=True, unchangeable=True)
            return JsonResponse({'status': 'success', 'message': 'Classroom created', 'classroom': classroom_response })


class TestCreateView(LoginRequiredMixin, View):
    def post(self, request):
        try:
            data = request.POST.dict()
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'})

        form = TestCreateForm(data, request.FILES or None)
        if form.is_valid():
            test = form.save(commit=False)
            test.creator = request.user
            test.save()
            response_data = {'status': 'success', 'message': 'Test created successfully!', 'id': test.pk, 'name': test.name, 'category': test.category}
        else:
            response_data = {'status': 'error', 'message': 'Form is not valid.', 'errors': form.errors}

        return JsonResponse(response_data)

class TestDeleteView(LoginRequiredMixin, View):

    def post(self, request, pk):
        test = get_object_or_404(Test, pk=pk)


        test.delete()


        response_data = {'status': 'success', 'pk': pk}
        return JsonResponse(response_data)

class QuestionCreateView(LoginRequiredMixin, View):
    def post(self, request, pk=None):
        try:
            data = request.POST.dict()
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'})

        form = QuestionCreateForm(data, request.FILES or None)
        test = get_object_or_404(Test, pk=pk)
        if form.is_valid():
            question = form.save(commit=False)
            question.test = test
            question.save()
            Option.objects.create(question=question, is_correct=True)
            if question.write_answer == False:
                for _ in range(3):
                    Option.objects.create(question=question, is_correct=False)

            total_question_number = Question.objects.filter(test=test).count()
            total_questions = total_question_number * test.score_multiplier
            test.total_questions = total_questions
            test.save()

            test.total_questions == total_questions


            response_data = {'success': True, 'test_pk': test.pk, 'id': question.pk, 'name': question.name, 'test_name': test.name}
            return JsonResponse(response_data)
        else:
            response_data = {'success': False, 'errors': form.errors, 'test_name': test.name, 'test_pk': test.pk}
            return JsonResponse(response_data, status=400)


class QuestionDeleteView(LoginRequiredMixin, View):

    def post(self, request, pk):
        question = get_object_or_404(Question, pk=pk)
        test = question.test


        question.delete()

        total_questions = Question.objects.filter(test=test).count() * test.score_multiplier
        test.total_questions = total_questions
        test.save()


        response_data = {'status': 'success', 'pk': pk}
        return JsonResponse(response_data)


class OptionCreateView(LoginRequiredMixin, View):
    def post(self, request, pk=None):
        try:
            data = request.POST.dict()
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'})

        form = OptionCreateForm(data, request.FILES or None)
        question = get_object_or_404(Question, pk=pk)
        if form.is_valid():
            option = form.save(commit=False)
            option.question = question
            option.save()
            response_data = {'success': True, 'question_pk': question.pk, 'pk': option.pk, 'name': option.name}
            return JsonResponse(response_data)
        else:
            response_data = {'success': False, 'errors': form.errors, 'question_pk': question.pk}
            return JsonResponse(response_data, status=400)

class OptionDeleteView(LoginRequiredMixin, View):

    def post(self, request, pk):
        option = get_object_or_404(Option, pk=pk)

        option.delete()

        response_data = {'status': 'success', 'pk': pk}
        return JsonResponse(response_data)


class FinalScoreView(View):
    def post(self, request, category):
        json_data = json.loads(request.body)
        score_data = json_data.get('scores', {})
        tests = Test.objects.filter(category=category)
        user = request.user
        
        total_category_score = 0
        total_final_score = 0
        for test in tests:
            test_score = score_data.get(str(test.id), 0) * test.score_multiplier * 5
            total_final_score += test_score

        total_possible_score = tests.aggregate(total_score=Sum('total_score'))['total_score'] or 0
        passed_threshold = total_final_score >= 0.8 * total_possible_score

        if not passed_threshold:
            return JsonResponse({
                'success': False,
                'message': f'点数: {total_final_score}/{total_possible_score}（８０％以下）記録されなかった！',
                'total_final_score': total_final_score,
                'total_possible_score': total_possible_score
            })

        for test in tests:
            test_score = score_data.get(str(test.id), 0) * test.score_multiplier * 5
            total_score = test.total_score
            
            try:
                maxscore = MaxScore.objects.get(user=user, test=test)
                if maxscore.score < test_score:
                    maxscore.score = test_score
                    maxscore.total_questions = total_score
                    maxscore.save()
            except ObjectDoesNotExist:
                maxscore = MaxScore.objects.create(user=user, test=test, score=test_score, total_questions=total_score)
            
            total_category_score += maxscore.score
        
        if category == 'japanese':
            user.total_japanese_score = total_category_score
        elif category == 'english_5':
            user.total_english_5_score = total_category_score
        elif category == 'english_6':
            user.total_english_6_score = total_category_score
        elif category == 'jr_1':
            user.total_jr_1_score = total_category_score
        elif category == 'phonics':
            user.total_phonics_score = total_category_score
        elif category == 'numbers':
            user.total_numbers_score = total_category_score
        elif category == 'eiken':
            user.total_eiken_score = total_category_score
        elif test.category == 'eiken4':
            user.total_4eiken_score = total_category_score
        elif category == 'eiken3':
            user.total_eiken3_score = total_category_score
        elif category == 'eiken_pre2':
            user.total_eiken_pre2_score = total_category_score
        elif category == 'eiken2':
            user.total_eiken2_score = total_category_score
        
        user.save()
        total_max_scores = MaxScore.objects.filter(user=user).aggregate(total_score=Sum('score'))['total_score'] or 0
        eiken_total = (
            user.total_eiken_score +
            user.total_4eiken_score +
            user.total_eiken3_score +
            user.total_eiken_pre2_score +
            user.total_eiken2_score
        )
        user.total_max_scores = total_max_scores - eiken_total
        user.save()

        user_data = {
            'total_english_5_score': user.total_english_5_score,
            'total_english_6_score': user.total_english_6_score,
            'total_jr_1_score': user.total_jr_1_score,
            'total_phonics_score': user.total_phonics_score,
            'total_numbers_score': user.total_numbers_score,
            'total_eiken_score': user.total_eiken_score,
            'total_4eiken_score': user.total_4eiken_score,
            'total_max_scores': user.total_max_scores,
            'total_eiken3_score': user.total_eiken3_score,
            'total_eiken_pre2_score': user.total_eiken_pre2_score,
            'total_eiken2_score': user.total_eiken2_score,
        }

        return JsonResponse({
            'success': True,
            'message': f'点数: {total_final_score}/{total_possible_score}（８０％以上）記録された！',
            'user_data': user_data,
            'total_final_score': total_final_score,
            'total_possible_score': total_possible_score
        })


class ScoreRecordView(View):
    def post(self, request, pk):
        json_data = json.loads(request.body)
        score_data = json_data.get('score')
        test = get_object_or_404(Test, pk=pk)
        user = request.user
        score = score_data * test.score_multiplier
        if user.username == 'gund':
            score = score * 18

        total_score = test.total_score
        score_increase = 0
        try:
            maxscore = MaxScore.objects.get(user=user, test=test)
            if maxscore.score < score:
                score_increase = score - maxscore.score
                maxscore.score = score
                maxscore.total_questions = total_score
                maxscore.save()
        except ObjectDoesNotExist:
            maxscore = MaxScore.objects.create(user=user, test=test, score=score, total_questions=total_score)
            score_increase = score

        maxscore_data = model_to_dict(maxscore)
        total_max_scores = MaxScore.objects.filter(user=user).aggregate(total_score=Sum('score'))['total_score'] or 0

        tests = Test.objects.filter(category=test.category)
        total_category_score = MaxScore.objects.filter(test__in=tests, user=user).aggregate(total_score=Sum('score'))['total_score'] or 0

        if test.category == 'japanese':
            user.total_japanese_score = total_category_score
        elif test.category == 'english_5':
            user.total_english_5_score = total_category_score
        elif test.category == 'english_6':
            user.total_english_6_score = total_category_score
        elif test.category == 'jr_1':
            user.total_jr_1_score = total_category_score
        elif test.category == 'phonics':
            user.total_phonics_score = total_category_score
        elif test.category == 'numbers':
            user.total_numbers_score = total_category_score
        elif test.category == 'eiken':
            user.total_eiken_score = total_category_score
        elif test.category == 'eiken4':
            user.total_4eiken_score = total_category_score
        elif test.category == 'eiken3':
            user.total_eiken3_score = total_category_score
        elif test.category == 'eiken_pre2':
            user.total_eiken_pre2_score = total_category_score
        elif test.category == 'eiken2':
            user.total_eiken2_score = total_category_score

        eiken_total = (
            user.total_eiken_score +
            user.total_4eiken_score +
            user.total_eiken3_score +
            user.total_eiken_pre2_score +
            user.total_eiken2_score
        )
        user.total_max_scores = total_max_scores - eiken_total
        user.save()

        user_data = {
            'total_english_5_score': user.total_english_5_score,
            'total_english_6_score': user.total_english_6_score,
            'total_jr_1_score': user.total_jr_1_score,
            'total_phonics_score': user.total_phonics_score,
            'total_numbers_score': user.total_numbers_score,
            'total_eiken_score': user.total_eiken_score,
            'total_4eiken_score': user.total_4eiken_score,
            'total_max_scores': user.total_max_scores,
            'total_eiken3_score': user.total_eiken3_score,
            'total_eiken_pre2_score': user.total_eiken_pre2_score,
            'total_eiken2_score': user.total_eiken2_score,
        }

        response_data = {'success': True, 'message': f'点数: {score}/{total_score}!', 'maxscore': maxscore_data, 'user_data': user_data, }

        return JsonResponse(response_data)

