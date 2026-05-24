from django.urls import path
from . import views

urlpatterns = [
    path('', views.MyOrdersView.as_view(), name='my-orders'),
    path('create/', views.OrderCreateView.as_view(), name='order-create'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
]
