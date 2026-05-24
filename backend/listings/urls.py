from django.urls import path
from . import views

urlpatterns = [
    path('', views.ListingListCreateView.as_view(), name='listing-list-create'),
    path('mine/', views.MyListingsView.as_view(), name='my-listings'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('<int:pk>/', views.ListingDetailView.as_view(), name='listing-detail'),
    path('<int:pk>/status/', views.ListingStatusUpdateView.as_view(), name='listing-status'),
]
