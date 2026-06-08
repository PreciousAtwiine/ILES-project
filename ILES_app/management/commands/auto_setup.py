from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from ILES_app.models import Department, Company

User = get_user_model()

class Command(BaseCommand):
    help = 'Auto-setup departments, companies, and admin'

    def handle(self, *args, **options):
        self.stdout.write('Running auto setup...')
        
        if Department.objects.count() == 0:
            self.stdout.write('Loading departments...')
            try:
                call_command('loaddata', 'departments.json', verbosity=0)
                self.stdout.write(self.style.SUCCESS(f'Loaded {Department.objects.count()} departments'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error loading departments: {e}'))
        else:
            self.stdout.write(self.style.WARNING(f'Departments already exist, skipping...'))
        
        if Company.objects.count() == 0:
            self.stdout.write('Loading companies...')
            try:
                call_command('loaddata', 'companies.json', verbosity=0)
                self.stdout.write(self.style.SUCCESS(f'Loaded {Company.objects.count()} companies'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error loading companies: {e}'))
        else:
            self.stdout.write(self.style.WARNING(f'Companies already exist, skipping...'))
        
        # Ensures admin exists and has correct role
        User.objects.update_or_create(
            username='admin',
            defaults={
                'email': 'admin@iles.com',
                'is_superuser': True,
                'is_staff': True,
                'role': 'admin',
            }
        )
        admin = User.objects.get(username='admin')
        admin.set_password('admin123')
        admin.save()
        self.stdout.write(self.style.SUCCESS('Superuser password reset to admin123 and role set to admin'))
        
        self.stdout.write(self.style.SUCCESS('Auto setup complete!'))
