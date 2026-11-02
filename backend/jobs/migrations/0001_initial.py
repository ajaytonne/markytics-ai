from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='JobCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Skill',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('skills', models.JSONField(blank=True, default=list)),
                ('location', models.CharField(max_length=150)),
                ('employment_type', models.CharField(choices=[('FULL_TIME', 'Full Time'), ('PART_TIME', 'Part Time'), ('CONTRACT', 'Contract'), ('INTERNSHIP', 'Internship')], default='FULL_TIME', max_length=20)),
                ('workplace_type', models.CharField(choices=[('ONSITE', 'Onsite'), ('HYBRID', 'Hybrid'), ('REMOTE', 'Remote')], default='HYBRID', max_length=20)),
                ('min_experience', models.PositiveIntegerField(default=0)),
                ('max_experience', models.PositiveIntegerField(default=0)),
                ('min_salary', models.PositiveIntegerField(default=0)),
                ('max_salary', models.PositiveIntegerField(default=0)),
                ('salary_currency', models.CharField(default='INR', max_length=10)),
                ('salary_period', models.CharField(choices=[('ANNUAL', 'Annual'), ('MONTHLY', 'Monthly')], default='ANNUAL', max_length=20)),
                ('application_deadline', models.DateTimeField(blank=True, null=True)),
                ('status', models.CharField(choices=[('DRAFT', 'Draft'), ('OPEN', 'Open'), ('CLOSED', 'Closed')], default='DRAFT', max_length=20)),
                ('published_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='jobs', to='jobs.jobcategory')),
                ('recruiter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posted_jobs', to='accounts.user')),
            ],
        ),
    ]
