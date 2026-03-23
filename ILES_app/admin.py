from django.contrib import admin
from .models import User,InternshipPlacement,WeeklyLog
# Register your models here.
admin.site.register(User)
admin.site.register(InternshipPlacement)

admin.site.register(WeeklyLog)
admin.site.register(Evaluation)
