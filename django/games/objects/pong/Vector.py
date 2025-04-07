from __future__ import annotations

import math
from .Point import Point

class Vector:

    def __init__(self, x: float, y: float) -> None:
        self.norm: float = math.dist((0, 0), (x, y))
        self.x: float = x
        self.y: float = y

    def __truediv__(self, denominator: float):
        return Vector(self.x / denominator, self.y / denominator)
    
    def angle(self, vector: Vector):
        scalar_product: float = self.scalar(vector)
        if (scalar_product is None):
            return None
        cos: float = scalar_product / (vector.norm * self.norm)
        
        angle: float = math.acos(cos)
        
        return angle

    def scalar(self, vector: Vector):
        return self.x * vector.x + vector.y * self.y
    
    def __str__(self) -> str:
        return f"Vector(x: {self.x}, y: {self.y}, norme: {self.norm})"
    
    def __eq__(self, __value: Vector) -> bool:
        return (self.x == __value.x and
                self.x == __value.x and 
                self.norm == __value.norm)