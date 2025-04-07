from __future__ import annotations

from ... import config

from .Position import Position
from .Point import Point

import time
import math
class Ball:
    
    def __init__(self) -> None:
        self.size: float = config.BALL_SIZE
        self.position: Position = Position(Point(config.BALL_SPAWN_POS_X + self.size / 2, config.BALL_SPAWN_POS_Y + self.size / 2), time.time())
        self.angle: float = 0
        self.speed: float = 0
    
    def reset(self, target: Point) -> None:
        self.position: Position = Position(Point(config.BALL_SPAWN_POS_X + self.size / 2, config.BALL_SPAWN_POS_Y + self.size / 2), time.time())
        self.angle = math.atan2(target.y - self.position.location.y, target.x - self.position.location.x)
        self.speed = config.BALL_SPEED_START
    
    def to_dict(self) -> dict:
        
        data: dict = {
            "size": self.size,
            "speed": self.speed,
            "position": self.position.to_dict(),
            "angle": self.angle,
        }
        
        return data
    
    def __str__(self) -> str:
        return f"Ball(size: {self.size}, speed: {self.speed}, angle: {self.angle}, position: {self.position})"