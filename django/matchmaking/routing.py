from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/matchmaking/(?P<game_type>\w+)/(?P<mode>\d+)$', consumers.MatchMaking.as_asgi())
]
