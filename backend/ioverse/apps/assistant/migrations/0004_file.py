# Generated by Django 5.1.2 on 2024-11-09 16:59

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assistant', '0003_alter_vectorstore_expires_after_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.CharField(help_text='The unique identifier of the OpenAI API object.', max_length=100, primary_key=True, serialize=False)),
                ('object', models.CharField(help_text='The object type.', max_length=50)),
                ('created_at', models.IntegerField(help_text='Unix timestamp (in seconds) for when the object was created.')),
                ('bytes', models.PositiveIntegerField(help_text='The size of the file in bytes. Must be a positive integer.')),
                ('filename', models.CharField(help_text='The name of the file.', max_length=255)),
                ('purpose', models.CharField(choices=[('assistants', 'Assistants'), ('assistants_output', 'Assistants Output'), ('batch', 'Batch'), ('batch_output', 'Batch Output'), ('fine-tune', 'Fine-tune'), ('fine-tune-results', 'Fine-tune Results'), ('vision', 'Vision')], help_text="The intended purpose of the file, with choices including 'assistants', 'fine-tune', and 'vision'.", max_length=20)),
                ('owner', models.ForeignKey(help_text='The user owning this model.', on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_owned', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'File',
                'verbose_name_plural': 'Files',
            },
        ),
    ]
