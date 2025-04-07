from transcendence.abstract.AbstractRoom import AbstractRoom
from transcendence.abstract.AbstractRoomMember import AbstractRoomMember

from .APlayer import APlayer
from .ASpectator import ASpectator

from ..models import GameModel

from django.contrib.auth.models import User

class AGame(AbstractRoom):
    
    def __init__(self, game_type: str, game_id: int, game_manager):
        
        super().__init__(game_manager)
        
        self.game_manager = game_manager
        
        self.model: GameModel = GameModel.objects.get(pk = game_id, game_type = game_type)
        
        players: list[User] = self.model.get_players()

        self.players: list[APlayer] = [APlayer(player.pk, None, self) for player in players]
        
        self.spectators: list[ASpectator] = []

        self.game_id: int = game_id
    
    def get_players_id(self) -> list[int]:
        return [player.pk for player in self.players]
    
    def get_players_connected(self) -> list[APlayer]:
        return [player for player in self.players if player.is_connected()]
    
    def get_player_by_user_id(self, user_id: int) -> APlayer:
        for player in self.players:
            if (player.user.pk == user_id):
                return player
        return None
    
    def broadcast(self, detail: str, data: dict = {}, excludeds: list[ASpectator | APlayer] = []):
        
        members: list[APlayer | ASpectator] = self.get_players_connected() + self.spectators
        
        for excluded in excludeds:
            if (excluded in members):
                members.remove(excluded)
        
        for member in members:
            member.send(detail, data)