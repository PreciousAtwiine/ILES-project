from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from rest_framework_simplejwt.views import ( 

    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'placements', InternshipPlacementViewSet)
router.register(r'logs', WeeklyLogViewSet)
router.register(r'evaluations', EvaluationViewSet)

urlpatterns = [
    # SPECIFIC STUDENT URLS FIRST
    path('api/placements/apply/', ApplyForPlacementView.as_view(), name='apply'),
    path('api/student/placement-status/', StudentPlacementStatusView.as_view(), name='placement-status'),
    path('api/student/logs/', StudentLogsListView.as_view(), name='student-logs'),
    
    # DASHBOARDS
    path('api/student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('api/supervisor/dashboard/', SupervisorDashboardView.as_view(), name='supervisor-dashboard'),
    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    
    # SUPERVISOR HELPERS
    path('api/supervisor/assigned-students/', AssignedStudentsView.as_view(), name='assigned-students'),
    path('api/supervisor/pending-logs/', PendingLogsView.as_view(), name='pending-logs'),
    
    # AUTH
    path('api/logout/', LogoutView.as_view(), name='logout'),
    
    # JWT AUTH - These now work because we imported them
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # ROUTER LAST
    path('', include(router.urls)),
]


















''' AVAI URLS STUDENTS
GET    /api/student/dashboard/
GET    /api/student/placement-status/
GET    /api/student/logs/
POST   /api/student/logs/
POST   /api/placements/apply/

WORK
GET    /api/supervisor/dashboard/
GET    /api/supervisor/assigned-students/
GET    /api/supervisor/pending-logs/
GET    /api/logs/pending/
PUT    /api/logs/{id}/review/
POST   /api/evaluations/workplace/



STAFF
ACADEM
GET    /api/supervisor/dashboard/
GET    /api/supervisor/assigned-students/
GET    /api/supervisor/pending-logs/
GET    /api/logs/pending/
PUT    /api/logs/{id}/review/id should be there
POST   /api/evaluations/academic/
ADMIN
GET    /api/users/
GET    /api/users/pending_staff/
POST   /api/users/approve_staff/
GET    /api/placements/
GET    /api/placements/pending/
GET    /api/placements/{id}/assign_supervisors/ ID should be there it is like sesion
POST   /api/placements/{id}/assign_supervisors/
GET    /api/admin/dashboard/'''
