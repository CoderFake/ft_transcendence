
from channels.generic.websocket import WebsocketConsumer

from transcendence.abstract.AbstractRoomMember import AbstractRoomMember

from django.contrib.auth.models import User

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .AGame import AGame

class ASpectator(AbstractRoomMember):

    def __init__(self, user: User, socket: WebsocketConsumer, game):
        
        super().__init__(user, socket)
        
        self.game: AGame = game