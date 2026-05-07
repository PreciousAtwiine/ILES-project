#!/usr/bin/env bash
# Exit immediately if any command fails
set -o errexit

# Install all Python dependencies
pip install -r requirements.txt

# Collect static files (admin, DRF UI, etc.) into STATIC_ROOT
python manage.py collectstatic --no-input

# Run database migrations
python manage.py migrate