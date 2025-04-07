from django.urls import path

from .views import chat
from .views import ask

urlpatterns = [
    path("", chat.ChannelView.as_view(), name="chats_page"),
    path("ask/", ask.AskView.as_view(), name="chats_ask"),
    path("ask/accept/", ask.AskAcceptView.as_view(), name="chats_ask_accept"),
	path("ask/<int:pk>", ask.AskView.as_view(), name="chats_ask_get"),
]
