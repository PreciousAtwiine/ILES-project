from django.contrib import admin
from .models import Department, User, InternshipPlacement, WeeklyLog, Evaluation

from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email']
    search_fields = ['name']
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'college']
    search_fields = ['name', 'code']
    list_filter = ['college']


admin.site.register(User)
admin.site.register(InternshipPlacement)
admin.site.register(WeeklyLog)
admin.site.register(Evaluation)