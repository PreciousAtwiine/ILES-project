from django.shortcuts import render,redirect
from .form import signupForm
from .models import student
# Create your views here.
def signup(request):
    if request.method == 'POST':
        details =signupForm(request.POST)
        if details.is_valid():
            user= details.save()
            student_no=request.POST['student_no']
            student.objects.create(
            user = user,
            student_no =student_no
            )
            
            return redirect('/reason/')
    else:
        details = signupForm()
    return render(request,'signup.html',{'details': details})    
        