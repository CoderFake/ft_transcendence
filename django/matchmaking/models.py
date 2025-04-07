from django.db import models

from channels.generic.websocket import WebsocketConsumer
import json

from transcendence.abstract.AbstractRoom import AbstractRoom
from transcendence.abstract.AbstractRoomManager import AbstractRoomManager
from transcendence.abstract.AbstractRoomMember import AbstractRoomMember

# Create your models here.
class Waiter(AbstractRoomMember):
    pass

class WaitingRoom(AbstractRoom):
    
    def __init__(self, room_manager, game_type: str, mode: int):
        
        super().__init__(room_manager)
        self._member_list: set[Waiter]

        self.mode: int = mode
        self.game_type: str = game_type

    def append(self, waiter: Waiter):

        tmp: Waiter = self.get_member_by_user(waiter.user)
        if (tmp is not None):
            tmp.send("Connection close: Another connection open with the same user id.")
            self.remove(tmp)

        waiter.socket.accept()

        super().append(waiter)

class WaitingRoomManager(AbstractRoomManager):

    def __init__(self):
        super().__init__()
        
        self._room_list: set[WaitingRoom]


    def get(self, game_type: str, mode: int) -> WaitingRoom:

        for waiting_room in self._room_list:
            waiting_room: WaitingRoom
            if (waiting_room.mode == mode and waiting_room.game_type == game_type):
                return waiting_room
        
        tmp: WaitingRoom = WaitingRoom(self, game_type, mode)
        
        super().append(tmp)
        
        return tmp

waiting_room_manager: WaitingRoomManager = WaitingRoomManager()