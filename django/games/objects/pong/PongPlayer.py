from __future__ import annotations

from ... import config

from channels.generic.websocket import WebsocketConsumer

from django.contrib.auth.models import User

from .Position import Position
from ..APlayer import APlayer
from .Segment import Segment

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .PongGame import PongGame

class PongPlayer(APlayer):
    
    def __init__(self, game: PongGame, user: User, socket: WebsocketConsumer, rail: Segment) -> None:
        
        super().__init__(user, socket, game)
        
        self.position: Position = Position(0.5, 0)
        
        self.score: list[int] = []
        
        self.rail: Segment = rail

        self.is_eliminated: bool = False

        self.game: PongGame
        
    def eliminate(self):
        
        self.is_eliminated = True

    def receive(self, data: dict):
        
        detail: str = data.get("detail")

        if (detail is None):
            return
        
        if (detail == "update_my_paddle_pos"):
            self.update_position(data)
    
    def update_position(self, data: dict):
        
        new_position: Position = Position(None)
        
        position_dict = data.get("position")
        if (position_dict is None):
            self.send_error("missing position")
            return
        
        new_position.location = position_dict.get("location")
        if (new_position.location is None):
            self.send_error("missing location")
            return
        
        new_position.time = data.get("time")
        
        if (new_position.time is None):
            self.send_error("missing time")
            return
        
        if (self.position.time > new_position.time):
            self.send_error("time error")
            return
        
        distance: float = abs(self.position.location - new_position.location) 
        
        sign: int = 1 if self.position.location >= new_position.location else -1
        
        time_difference: float = (new_position.time - self.position.time) / 1000
        
        max_distance: float = config.PADDLE_SPEED_PER_SECOND_MAX * (time_difference) * config.PADDLE_SPEED_PER_SECOND_TOLERANCE
        
        new_position_verified: Position = new_position.copy()

        if (distance > max_distance):
            new_position_verified.location = self.position.location + max_distance * sign
        
        if (not config.PADDLE_POSITION_MIN <= new_position_verified.location <= config.PADDLE_POSITION_MAX):
            
            new_position_verified.location = max(new_position_verified.location, config.PADDLE_POSITION_MIN)
            new_position_verified.location = min(new_position_verified.location, config.PADDLE_POSITION_MAX)

        invalid_pos: bool = new_position.location != new_position_verified.location
        
        if (new_position.location != self.position.location):
            self.game.update_player(self)

        self.position.location = new_position.location
        
        if (invalid_pos):
            self.send("update_player", self.to_dict())
    
    def connect(self, socket: WebsocketConsumer):
        self.socket = socket
        self.accept()
        self.game.update_player(self)
    
    def disconnect(self, code: int = 1000):
        self.socket = None
        self.game.leave(self)
    
    def add_goal(self):
        
        timestamp = self.game.model.add_goal(self.user)
        
        self.score.append(timestamp)
        
        return timestamp
    
    def to_dict(self) -> dict:
        
        data = {
            "username": self.user.username,
            "id": self.user.pk,
            "position": self.position.to_dict(),
            "score": self.score,
            
            "isEliminated": self.is_eliminated,
            
            "rail": self.rail.to_dict(),
            
            "isConnected": self.is_connected(),
        }
        
        return data