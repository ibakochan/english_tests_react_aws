from django.shortcuts import redirect
from django.urls import reverse
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

from django.middleware.csrf import get_token


 








class RedirectAuthenticatedUserMiddleware:
    """
    Redirects authenticated users away from login/signup pages
    to their appropriate profile pages on eibaru.jp.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            if request.path in ['/accounts/login/ar/', '/signup/student/ar/', '/signup/teacher/ar/', '/accounts/signup/ar/']:
                return redirect('main:profile_ar')
            elif request.path in ['/accounts/login/', '/accounts/login', '/signup/student/', '/signup/teacher/', '/accounts/signup']:
                return redirect('main:profile')

        return self.get_response(request)





class DomainRedirectMiddleware:
    """
    Redirects users to the correct profile page based on eibaru.jp paths.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host()

        if host.startswith("eibaru.jp"):
            if request.path == "/accounts":
                return redirect(reverse("main:profile"))
            elif request.path.startswith("/ar/"):
                return redirect(reverse("main:profile_ar"))

        return self.get_response(request)
