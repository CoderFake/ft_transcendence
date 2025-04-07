from __future__ import annotations

from math import dist
class Point:
    
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y
    
    def __str__(self) -> str:
        return f"Point(x: {self.x}, y: {self.y})"
    
    def __repr__(self) -> str:
        return f"Point(x: {self.x}, y: {self.x})"
    
    def __eq__(self, __value: object) -> bool:
        return (self.x == __value.x and self.y == __value.y)
    
    def distance(self, point: Point):
        return dist((point.x, point.y), (self.x, self.y))
    
    def copy(self):
        return Point(self.x, self.y)
    
    def to_dict(self) -> dict:
        
        data: dict[str: float] = {
            "x": self.x,
            "y": self.y,
        }
        
        return data