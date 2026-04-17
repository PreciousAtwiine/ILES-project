# Generated manually for Evaluation timestamps and WeeklyLog.reviewed_at

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ILES_app', '0002_weeklylog_attachment_weeklylog_working_hours'),
    ]

    operations = [
        migrations.AddField(
            model_name='evaluation',
            name='workplace_submitted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='academic_submitted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='weeklylog',
            name='reviewed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
