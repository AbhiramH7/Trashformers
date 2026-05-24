from django.urls import path
from . import views

urlpatterns = [
    path('', views.ReviewCreateView.as_view(), name='review-create'),
    path('user/<int:user_id>/', views.UserReviewsView.as_view(), name='user-reviews'),
]
