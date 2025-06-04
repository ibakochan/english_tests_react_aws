import json
from django.http import JsonResponse
from django.views import View
from django.shortcuts import get_object_or_404, render, redirect
from .models import CustomUser
from main.models import Student, Teacher, Classroom
from django.contrib.auth import authenticate, login
from allauth.account.views import LoginView
from .forms import CustomAuthenticationForm, SignUpForm
from django.views.decorators.cache import never_cache
from django.utils.decorators import method_decorator
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.cache import never_cache

@method_decorator(never_cache, name='dispatch')
class CustomLoginView(View):
    template_name = 'accounts/login.html'

    def get(self, request, *args, **kwargs):
        form = AuthenticationForm(request)
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = AuthenticationForm(request, data=request.POST)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect('main:profile')
            else:
                form.add_error(None, "ユーザーネームまたはパスワードが間違っています。")
                return render(request, self.template_name, {'form': form})

        return render(request, self.template_name, {'form': form})




@method_decorator(never_cache, name='dispatch')
class SignUpView(View):
    template_name = 'accounts/signup.html'

    def get(self, request):
        form = SignUpForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = SignUpForm(request.POST)

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

class StudentUpdateView(View):
    def post(self, request, pk):
        user = get_object_or_404(CustomUser, pk=pk)
        student = get_object_or_404(Student, user=user)
        teacher = get_object_or_404(Teacher, user=request.user)

        shared_classroom_exists = Classroom.objects.filter(
            teacher=teacher,
            students=student
        ).exists()

        if not shared_classroom_exists:
            return HttpResponseForbidden("You don't have permission to reset this student's password.")

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        password = data.get('password')
        if not password:
            return JsonResponse({'error': 'Password is required'}, status=400)

        user.set_password(password)
        user.save()

        return JsonResponse({'message': 'Password reset successful'})