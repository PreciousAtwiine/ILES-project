#!/usr/bin/env bash
# Exit immediately if any command fails
set -o errexit

# Install all Python dependencies
pip install -r requirements.txt

# Collect static files (admin, DRF UI, etc.) into STATIC_ROOT
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate

#Creating superuser
pyhton manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser('admin','admin@iles.com','admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
"