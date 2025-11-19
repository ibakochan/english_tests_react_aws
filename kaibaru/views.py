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
from django.core.files.storage import default_storage

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

        subdomain = request.get_host().split('.')[0]
        
        # クラブオブジェクトを取得
        club = get_object_or_404(Club, subdomain=subdomain)

        # club_data辞書にデフォルト値を設定
        club_data = {
            'title': club.title if club and club.title else 'ホームページ兼会員管理システム作成',
            'search_description': club.search_description if club and club.search_description else 'Wordのようにページを作成でき、会員管理システムです',
            'favicon': club.favicon.url if club and club.favicon else 'https://storage.googleapis.com/ibaru_repair/kaibarufavicon.png',
            'og_image': club.og_image.url if club and club.og_image else 'https://storage.googleapis.com/ibaru_repair/kaibarufavicon.png',
            'subdomain': subdomain or 'kaibaru',
        }


        if request.user.is_authenticated:
            user = request.user
            has_google = SocialAccount.objects.filter(user=user, provider='google').exists()

        return render(request, self.template_name, {
            'user': user,
            'has_google': has_google,
            'club_data': club_data,
        })



