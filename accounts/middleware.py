from django.shortcuts import redirect

class RedirectAuthenticatedUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            if request.path in ['/accounts/login/ar/', '/signup/student/ar/', '/signup/teacher/ar/', '/accounts/signup/ar/']:
                return redirect('main:profile_ar')
            elif request.path in ['/accounts/login/', '/accounts/login', '/signup/student/', '/signup/teacher/', '/accounts/signup']:
                return redirect('main:profile')

        response = self.get_response(request)
        return response

class RedirectSocialConnectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if request.path == '/account/3rdparty/':
            return redirect('/')

        return response