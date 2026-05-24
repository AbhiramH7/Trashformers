from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListingListCreateView.as_view(), name='listing-list-create'),
    path('<int:pk>/', views.ListingDetailView.as_view(), name='listing-detail'),
]
