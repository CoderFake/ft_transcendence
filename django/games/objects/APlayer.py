from __future__ import annotations

from channels.generic.websocket import WebsocketConsumer
from .ASpectator import ASpectator

class APlayer(ASpectator):
    
    def is_connected(self) -> bool:
        return self.socket != None
    
    def send_error(self, error_message: str, error_data = {}):
        
        data: dict = {
            "error_message": error_message
        }
        
        data.update(error_data)
        
        self.send("error", data)