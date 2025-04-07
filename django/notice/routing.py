from django.urls import re_path

from .consumers import NoticeConsumer

websocket_urlpatterns = [
    re_path(r'ws/notice$', NoticeConsumer.as_asgi()),
]
