from django.shortcuts import redirect

class RedirectAuthenticatedUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            if request.path in ['/accounts/login/', '/accounts/login', '/signup/student/', '/signup/teacher/']:
                return redirect('main:profile')

        response = self.get_response(request)
        return response