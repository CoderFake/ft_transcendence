from channels.generic.websocket import WebsocketConsumer

from django.contrib.auth.models import User

from games.models import GameModel

import json

from .models import Waiter, WaitingRoom, waiting_room_manager

class MatchMaking(WebsocketConsumer):

    def connect(self):

        user: User = self.scope["user"]
        
        if (user.is_anonymous or not user.is_authenticated):
            return

        self.mode: int = int(self.scope['url_route']['kwargs']['mode'])
        self.game_type: str = self.scope['url_route']['kwargs']['game_type']
        self.group_name = self.mode
        
        self.waiting_room: WaitingRoom = waiting_room_manager.get(self.game_type, self.mode)
        self.waiting_room.append(Waiter(user, self))

        if (self.mode < 2 or self.mode > 4):
            data: dict = {
                "detail": "The mode must be > 1 and < 4.",
            }
            self.send(json.dumps(data))
            self.disconnect(1000)
            return
        
        if (self.game_type not in ["pong"]):
            data: dict = {
                "detail": "The game_type must 'pong'",
            }
            self.send(json.dumps(data))
            self.disconnect(1000)
            return
        
        self.waiting_room.broadcast(f"{len(self.waiting_room)} / {self.waiting_room.mode}")
        if (len(self.waiting_room) == self.waiting_room.mode):
            game: GameModel = GameModel(game_type=self.game_type).create(self.waiting_room.get_members())
            self.waiting_room.broadcast("game_found", {"game_id": game.pk, "game_type": self.game_type})

    def disconnect(self, close_code):
        super().disconnect(close_code)
        waiting_room: WaitingRoom = waiting_room_manager.get(self.game_type, self.mode)
        waiter: Waiter = waiting_room.get_member_by_socket(self)
        if (waiter is not None):
            waiting_room.remove(waiter)