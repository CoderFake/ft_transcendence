from ..models import GameModel
from .pong.PongGame import PongGame

class GameManager():
    
    def __init__(self) -> None:
        self._game_list: list[PongGame] = []
    
    def remove(self, game: PongGame) -> None:
        if (game not in self._game_list):
            return
        self._game_list.remove(game)
    
    def get(self, game_id: int, game_type: str) -> PongGame:

        if (not GameModel.objects.filter(pk=game_id, finished=False, game_type=game_type).exists()):
            return None
        
        for game in self._game_list:
            game: PongGame
            if (game.game_id == game_id):
                return game

        game: PongGame
        if (game_type == "pong"):
            game = PongGame(game_id, self)
        else:
            return None
    
        self._game_list.append(game)
        
        return game