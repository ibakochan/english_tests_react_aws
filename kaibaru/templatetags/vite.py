import json
import os
from django import template
from django.conf import settings
from django.templatetags.static import static

register = template.Library()

@register.simple_tag
def vite(asset):
    """
    Usage:
        {% vite 'src/main.tsx' %}
    """
    manifest_path = os.path.join(
        settings.BASE_DIR,
        "static/kaibaru/dist/.vite/manifest.json"
    )

    with open(manifest_path, "r") as f:
        manifest = json.load(f)

    entry = manifest[asset]
    tags = []

    if "css" in entry:
        for css in entry["css"]:
            tags.append(
                f'<link rel="stylesheet" href="{static("kaibaru/dist/" + css)}">'
            )

    js_file = entry["file"]
    tags.append(
        f'<script type="module" src="{static("kaibaru/dist/" + js_file)}"></script>'
    )

    return "\n".join(tags)
