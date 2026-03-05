from django.contrib.auth.models import User
from rest_framework import serializers
class signupSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['username', 'first_name', 'last_name', 'email', 'password1', 'password2']
