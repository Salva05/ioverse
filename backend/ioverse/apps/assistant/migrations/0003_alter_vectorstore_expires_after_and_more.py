# Generated by Django 5.1.2 on 2024-11-09 04:15

import apps.assistant.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assistant', '0002_vectorstore_expires_at_vectorstore_last_active_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='vectorstore',
            name='expires_after',
            field=models.JSONField(blank=True, help_text='The expiration policy for the vector store.', null=True, validators=[apps.assistant.validators.validate_expires_after]),
        ),
        migrations.AlterField(
            model_name='vectorstore',
            name='expires_at',
            field=models.IntegerField(blank=True, help_text='The Unix timestamp (in seconds) for when the vector store will expire.', null=True),
        ),
        migrations.AlterField(
            model_name='vectorstore',
            name='name',
            field=models.CharField(blank=True, help_text='The name of the vector store.', max_length=255, null=True),
        ),
    ]
