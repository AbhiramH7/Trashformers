from django.urls import path
from . import views

urlpatterns = [
    path('send/', views.SendMessageView.as_view(), name='send-message'),
    path('messages/', views.MessageListView.as_view(), name='message-list'),
]
