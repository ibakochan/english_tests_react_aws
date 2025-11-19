from django.shortcuts import render
from django.views import View
from allauth.socialaccount.models import SocialAccount
from django.http import HttpResponseForbidden  # optional
from django.shortcuts import get_object_or_404
from .models import Club
from django.shortcuts import redirect
from django.conf import settings
from urllib.parse import urlencode
from urllib.parse import quote
import logging

logger = logging.getLogger(__name__)
def start_google_login(request):
    next_url = request.GET.get('next')
    if next_url:
        request.session['next_subdomain'] = next_url
    else:
        request.session['next_subdomain'] = "https://kaibaru.jp/"  
    return redirect("/account/google/login/")


class KaibaruPageView(View):
    template_name = 'kaibaru/kaibaru.html'

    def get(self, request):
        user = ""
        has_google = False

        if request.user.is_authenticated:
            user = request.user
            has_google = SocialAccount.objects.filter(user=user, provider='google').exists()

        return render(request, self.template_name, {
            'user': user,
            'has_google': has_google
        })



