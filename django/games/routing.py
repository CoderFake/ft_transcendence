from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/games/pong/(?P<game_id>\d+)$', consumers.PongWebSocket.as_asgi()),
]
