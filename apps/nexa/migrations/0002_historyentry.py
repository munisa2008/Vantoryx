import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nexa', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='HistoryEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entry_type', models.CharField(
                    choices=[
                        ('text', 'Text Scam'),
                        ('link', 'Link Analysis'),
                        ('reply', 'What to Reply'),
                        ('rewrite', 'Human Rewrite'),
                        ('reverse', 'Reverse Phishing'),
                        ('audio', 'Audio'),
                    ],
                    max_length=20,
                )),
                ('input_text', models.TextField(blank=True, null=True)),
                ('result', models.JSONField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('audio_task', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='history_entries',
                    to='nexa.audiotask',
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
