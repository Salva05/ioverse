# Generated by Django 5.1.2 on 2024-12-04 21:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='account',
            name='api_key',
            field=models.CharField(help_text='The API key of openai', max_length=255),
        ),
    ]
