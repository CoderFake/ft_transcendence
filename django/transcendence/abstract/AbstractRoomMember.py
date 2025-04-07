from channels.generic.websocket import WebsocketConsumer

from django.contrib.auth.models import User

import json

class AbstractRoomMember:

    def __init__(self, user: User, socket: WebsocketConsumer):
        self.user: User = user
        self.socket: WebsocketConsumer = socket
    
    def send(self, detail: str, data: dict = {}) -> None:
        raw_data: dict = {"detail": detail}
        raw_data.update(data)
        self.socket.send(text_data=json.dumps(raw_data))