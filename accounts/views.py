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
from django.shortcuts import redirect
from mozilla_django_oidc.views import OIDCAuthenticationRequestView

import logging
logger = logging.getLogger(__name__)

class EibaruOIDCCallbackView(View):
    def get(self, request):
        try:
            code = request.GET.get('code')
            if not code:
                raise ValueError("No code returned in callback")

            # Exchange code for token
            token_url = 'https://kaibaru.jp/oidc/token/'
            data = {
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': request.build_absolute_uri(),
                'client_id': settings.OIDC_RP_CLIENT_ID,
                'client_secret': settings.OIDC_RP_CLIENT_SECRET,
            }

            resp = requests.post(token_url, data=data)
            resp.raise_for_status()  # Will raise for non-200
            tokens = resp.json()
            access_token = tokens.get('access_token')
            if not access_token:
                raise ValueError("No access_token returned")

            # Save in session
            request.session['oidc_access_token'] = access_token
            return redirect('/')
        except Exception as e:
            logger.exception("OIDC callback error")
            return render(request, 'accounts/oidc_error.html', {'error': str(e)})

@method_decorator(never_cache, name='dispatch')
class EibaruOIDCLoginView(View):
    """Kaibaru login page used only for Eibaru OIDC requests"""
    template_name = 'accounts/oidc_login.html'

    def get(self, request):
        form = AuthenticationForm(request)
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = authenticate(
                username=form.cleaned_data['username'], 
                password=form.cleaned_data['password']
            )
            if user:
                login(request, user)
                # Redirect back to OIDC authorize URL
                next_url = request.GET.get('next', '/')
                return redirect(next_url)
        return render(request, self.template_name, {'form': form})

@method_decorator(never_cache, name='dispatch')
class CustomLoginView(View):
    template_name = 'accounts/login.html'

    def get(self, request, *args, **kwargs):
        form = AuthenticationForm(request)
        return render(request, self.template_name, {'form': form, 'path': request.path})

    def post(self, request, *args, **kwargs):
        form = AuthenticationForm(request, data=request.POST)

        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                return redirect("/")
            else:
                form.add_error(None, "ユーザーネームまたはパスワードが間違っています。")
                return render(request, self.template_name, {'form': form, 'path': request.path})

        return render(request, self.template_name, {'form': form, 'path': request.path})




@method_decorator(never_cache, name='dispatch')
class SignUpView(View):
    template_name = 'accounts/signup.html'

    def get(self, request):
        form = SignUpForm()
        return render(request, self.template_name, {'form': form, 'path': request.path})

    def post(self, request):
        form = SignUpForm(request.POST)

        username = request.POST.get('username')
        password = request.POST.get('password')
        if CustomUser.objects.filter(username=username).exists():
            if '/ar/' in request.path:
                error_message = "اسم المستخدم هذا مستخدم بالفعل"
            else:
                error_message = "このユーザネームはすでに使われている"
            return render(request, self.template_name, {'form': form, 'error_message': error_message, 'path': request.path})

        if len(username) > 10:
            if '/ar/' in request.path:
                error_message = "اسم المستخدم يجب أن لا يتجاوز 10 أحرف"
            else:
                error_message = "ユーザーネームは最大１０文字"
            return render(request, self.template_name, {'form': form, 'error_message': error_message, 'path': request.path})


        if form.is_valid():
            user = form.save()
            user = authenticate(request, username=username, password=password)
            login(request, user)
            return redirect("/")
        else:
            if '/ar/' in request.path:
                error_message = "لا يمكن أن يحتوي اسم المستخدم على مسافات أو رموز"
            else:
                error_message = "ユーザーネームにスペースや記号などは入れません"
            return render(request, self.template_name, {'form': form, 'error_message': error_message, 'path': request.path})
        return render(request, self.template_name, {'form': form, 'path': request.path})

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