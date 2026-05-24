from django.urls import path
from . import views

urlpatterns = [
    path('', views.ComplaintCreateView.as_view(), name='complaint-create'),
    path('mine/', views.MyComplaintsView.as_view(), name='my-complaints'),
]
