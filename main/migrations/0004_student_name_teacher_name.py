# Generated by Django 5.1.6 on 2025-02-19 05:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_remove_student_name_remove_teacher_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='name',
            field=models.CharField(default='no_name', max_length=200),
        ),
        migrations.AddField(
            model_name='teacher',
            name='name',
            field=models.CharField(default='no_name', max_length=200),
        ),
    ]
