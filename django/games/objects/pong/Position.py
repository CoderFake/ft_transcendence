from __future__ import annotations

from .Point import Point
class Position:
    
    def __init__(self, location: int | Point = 0, time: int = 0) -> None:
        self.time: float = time
        self.location: float | Point = location
    
    def copy(self):
        try:
            return Position(self.location.copy(), self.time)
        except:
            return Position(self.location, self.time)
    
    def to_dict(self):
        
        data: dict = {
            "time": self.time,
        }
        
        try:
            data.update({"location": self.location.to_dict()})
        except:
            data.update({"location": self.location})
                
        return data

    def __eq__(self, __value: Position) -> bool:
        return (self.location == __value.location)