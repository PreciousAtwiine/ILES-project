from django.db import models
from django.utils import timezone
import os

# Create your models here.

#User model
class User(models.Model):
    #Django automatically assigns an ID
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True, max_length = 200)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=50)
    department = models.CharField(max_length=100, blank=True, null=True)
    staff_number= models.CharField(max_length=50, blank=True,unique=True, null=True)
    student_number= models.CharField(max_length=50, blank=True, unique=True, null=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True, blank=True, null=True)
    
    def __str__(self):
        return self.username

#Internship placements
class InternshipPlacement (models.Model):
    student = models.ForeignKey('User', on_delete= models.CASCADE, related_name='internships')
    workplace_supervisor_id = models.IntegerField()
    academic_supervisor_id = models.IntegerField()
    company_name = models.CharField(max_length=200)
    company_address = models.TextField()
    company_contact = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=50)
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now= True)
    
    def __str__(self):
        return f"{self.student} - {self.company_name}"
    

    

    
    