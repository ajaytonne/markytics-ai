from django.db import migrations, models
import django.db.models.deletion
import applications.models

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
        ('jobs', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('resume_file', models.FileField(upload_to=applications.models.resume_upload_path)),
                ('original_resume_name', models.CharField(default='Resume.pdf', max_length=255)),
                ('cover_letter', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('APPLIED', 'Applied'), ('SHORTLISTED', 'Shortlisted'), ('INTERVIEW', 'Interview'), ('REJECTED', 'Rejected'), ('HIRED', 'Hired')], default='APPLIED', max_length=20)),
                ('applied_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='job_applications', to='accounts.user')),
                ('job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='applications', to='jobs.job')),
            ],
            options={
                'unique_together': {('job', 'candidate')},
            },
        ),
        migrations.CreateModel(
            name='ApplicationStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('previous_status', models.CharField(max_length=20)),
                ('new_status', models.CharField(max_length=20)),
                ('candidate_message', models.TextField(blank=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='accounts.user')),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='status_history', to='applications.application')),
            ],
        ),
    ]
