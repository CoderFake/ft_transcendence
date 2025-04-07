
from .Point import Point
from .Vector import Vector

import math

class Segment:
    
    def __init__(self, start: Point, stop: Point) -> None:
        self.start: Point = start
        self.stop: Point = stop

    def angle(self) -> float:
        return math.atan2((self.start.y - self.stop.y), (self.start.x - self.stop.x))
        
    def length(self):
        return self.start.distance(self.stop)
    
    def is_on(self, C: Point):
        return (self.start.distance(C) + self.stop.distance(C) == self.length())
    
    def __repr__(self) -> str:
        return f"Segment(start: {self.start}, stop: {self.stop})"
    
    def __str__(self) -> str:
        return f"Segment(start: {self.start}, stop: {self.stop})"
    
    def copy(self):
        return Segment(self.start.copy(), self.stop.copy())
    
    def center(self):
        return Point((self.start.x + self.stop.x) / 2, (self.start.y + self.stop.y) / 2)

    def to_dict(self) -> dict:
        
        data: dict[str: dict] = {
            "start": self.start.to_dict(),
            "stop": self.stop.to_dict(),
        }
        
        return data