# Generated by Django 5.1.6 on 2025-05-01 04:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0012_classroom_battle_permission'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='display_all',
            field=models.BooleanField(default=False),
        ),
    ]
