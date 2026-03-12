from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'placements', InternshipPlacementViewSet)
router.register(r'logs', WeeklyLogViewSet)
router.register(r'evaluations', EvaluationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/register/', RegisterView.as_view(), name='register'),
]
