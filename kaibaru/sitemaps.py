from django.contrib.sitemaps import Sitemap
from .models import Club

class ClubSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8
    protocol = None

    def items(self):
        clubs = list(Club.objects.filter(subdomain__isnull=False).exclude(subdomain=''))
        clubs.append(None)
        return clubs

    def location(self, obj):
        if obj is None:
            return "https://kaibaru.jp/"
        return f"https://{obj.subdomain}.kaibaru.jp/"

    def get_urls(self, site=None, **kwargs):
        # Override to ignore the 'site' argument entirely
        urls = []
        for item in self.items():
            urls.append({
                'location': self.location(item),
                'priority': self.priority,
                'changefreq': self.changefreq,
            })
        return urls
