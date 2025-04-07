from __future__ import annotations

from channels.generic.websocket import WebsocketConsumer

from django.contrib.auth.models import User

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .PongPlayer import PongPlayer
    from .PongGame import PongGame

from ..ASpectator import ASpectator
from .Ball import Ball

class PongSpectator(ASpectator):

    def __init__(self, user: User, socket: WebsocketConsumer, game: PongGame):
        super().__init__(user, socket, game)
        self.game: PongGame = game

    def send_paddle(self, player: PongPlayer):
        self.send("update_player", player.to_dict())    

    def send_ball(self, ball: Ball):
        self.send("update_ball", ball.to_dict())
    
    def disconnect(self, code: int = 1000):
        self.game.leave(self)