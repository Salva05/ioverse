# Generated by Django 5.1.2 on 2024-11-10 17:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assistant', '0004_file'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='message',
            name='completed_at',
        ),
        migrations.RemoveField(
            model_name='message',
            name='incomplete_at',
        ),
        migrations.RemoveField(
            model_name='message',
            name='incomplete_details',
        ),
    ]
