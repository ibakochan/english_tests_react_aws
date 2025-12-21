import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.kaibaru_settings")

app = Celery("mysite")

# Load config from Django settings, CELERY_ prefix
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks from installed apps
app.autodiscover_tasks()
