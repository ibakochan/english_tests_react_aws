from django_hosts import patterns, host

host_patterns = patterns('',
    host(r'eibaru', 'mysite.urls_main', name='eibaru'),
    host(r'kaibaru', 'mysite.urls_kaibaru', name='kaibaru'),
    host(r'(?P<subdomain>[^.]+)', 'mysite.urls_kaibaru', name='club'),
)
