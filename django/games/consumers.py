from __future__ import annotations
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import User
import json
from .objects.GameManager import GameManager
from .objects.pong.PongPlayer import PongPlayer

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .objects.pong.PongSpectator import PongSpectator
    from .objects.pong.PongGame import PongGame
game_manager: GameManager = GameManager()

class PongWebSocket(WebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.member = None

    def connect(self):

        self.user: User = self.scope["user"]
        if (self.user.pk is None):
            self.user.pk = 0

        self.accept()

        self.game_id = int(self.scope['url_route']['kwargs']['game_id'])
        
        self.game: PongGame = game_manager.get(self.game_id, "pong")
        
        if (self.game is None):
            self.send(text_data=json.dumps({"detail": "Game not found"}))
            self.disconnect(1404)
            return
        
        self.member: PongPlayer | PongSpectator = self.game.join(self.user, self)
    
    def disconnect(self, code):
        if (self.member is not None):
            self.member.disconnect()
        super().disconnect(code)

    def receive(self, text_data: str = None, bytes_data: bytes = None):
        
        if (text_data is None):
            return

        data: dict = json.loads(text_data)

        if (isinstance(self.member, PongPlayer)):
            self.member.receive(data)