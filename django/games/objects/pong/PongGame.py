from ..AGame import AGame
from .PongPlayer import PongPlayer
from .PongSpectator import PongSpectator
from .Wall import Wall
from .Segment import Segment
from .Point import Point
from .Ball import Ball

from ... import config

from channels.generic.websocket import WebsocketConsumer

from django.contrib.auth.models import User

from ...routine import routine

import random
import threading

class PongGame(AGame):
    
    def __init__(self, game_id: int, game_manager):
        super().__init__("pong", game_id, game_manager)
        
        self.players: list[PongPlayer]
        self.walls: list[Wall]
        
        players: list[User] = self.model.get_players()
        
        nb_players: int = len(players)
        if (nb_players == 2):
            corners = [Point(50, config.MAP_CENTER_Y - config.MAP_SIZE_Y / 4),
                       Point(config.MAP_SIZE_X - 50, config.MAP_CENTER_Y - config.MAP_SIZE_Y / 4),
                       Point(config.MAP_SIZE_X - 50, config.MAP_CENTER_Y + config.MAP_SIZE_Y / 4),
                       Point(50, config.MAP_CENTER_Y + config.MAP_SIZE_Y / 4)
                      ]
            
            self.players = [PongPlayer(self, players[0], None, Segment(corners[1].copy(), corners[2].copy())),
                            PongPlayer(self, players[1], None, Segment(corners[3].copy(), corners[0].copy()))]
            
            self.walls = [Wall(corners[0], corners[1]),
                          Wall(corners[2], corners[3])]
        else:
            corners: list[Point] = [Point(50, 50),
                                    Point(config.MAP_SIZE_X - 50, 50),
                                    Point(config.MAP_SIZE_X - 50, config.MAP_SIZE_Y - 50),
                                    Point(50, config.MAP_SIZE_Y - 50)]
            
            self.players = []
            self.walls = []
            
            for i in range(4):
                if i < nb_players:
                    self.players.append(PongPlayer(self, players[i], None, Segment(corners[i].copy(), corners[(i + 1) % 4].copy())))
                else:
                    self.walls.append(Segment(corners[i].copy(), corners[(i + 1) % 4].copy()))
    
        
        self.ball: Ball = Ball()
    
    def goal(self, goal_defenser: PongPlayer) -> None:
        
        timestamp: int = goal_defenser.add_goal()
        
        self.broadcast("goal", {"player_id": goal_defenser.user.pk,
                                "timestamp": timestamp})
        
        if len(goal_defenser.score) >= config.GAME_MAX_SCORE:
            
            self.eliminate(goal_defenser)
            
            player_list = self.get_valid_players()
            
            if len(player_list) == 1:
                self.finish(player_list[0])
                return
        
        players: list[PongPlayer] = self.get_valid_players()

        self.ball.reset(players[random.randint(0, len(players) -1)].rail.center())

    def get_valid_players(self) -> list[PongPlayer]:
        return [player for player in self.players if player.is_connected and not player.is_eliminated] 
            
    def finish(self, winner: PongPlayer) -> bool:
        self.broadcast("finish", {'winner_id': winner.user.pk})
        self.model.finish(winner.user)
        self.stopped = True
        self.players = []
        self.spectators = []
    
    def start(self):
        
        # Set to true to stop the thread routine
        self.stopped: bool = False
        
        self.model.start()
        
        self.broadcast("start")

        players: list[PongPlayer] = self.get_valid_players()

        self.ball.reset(players[random.randint(0, len(players) -1)].rail.center())
        
        self.broadcast("update_ball", self.ball.to_dict())
        
        self.thread = threading.Thread(target=routine, args=(self,))
        
        self.thread.start()
    
    def eliminate(self, eliminated: PongPlayer):
        
        self.broadcast("eliminated", {"eliminated_id": eliminated.user.pk})
        
        eliminated.eliminate()
        
    def _player_join(self, user: User, socket: WebsocketConsumer) -> PongPlayer | None:
        
        if (self.model.started):
            return None
        
        player = self.get_player_by_user_id(user.pk)
        if (player is None):
            return None

        # check if player is already connected
        if (player.is_connected()):
            player.disconnect(1001)
            
        player.socket = socket
        
        self.update_player(player)
        
        if len(self.players) == len(self.get_players_connected()):
            self.start()
            
        return player

    def _spectator_join(self, user: User, socket: WebsocketConsumer) -> PongSpectator:
        
        spectator: PongSpectator = PongSpectator(user, socket, self)
        
        self.spectators.append(spectator)
        
        return spectator
    
    def join(self, user: User, socket: WebsocketConsumer) -> PongSpectator | PongPlayer:
        
        member: PongPlayer | PongSpectator
        
        member = self._player_join(user, socket)
        
        if member is None:
            member = self._spectator_join(user, socket)
        
        self._send_game_data(member)
        
        return member
        
    def _player_leave(self, player: PongPlayer):
        
        if self.model.started:
            
            self.eliminate(player)
            
            players: list[PongPlayer] = self.get_valid_players()
            
            if len(players) == 1:
                self.finish(players[0])
    
    def _spectator_leave(self, spectator: PongSpectator):
        self.spectators.remove(spectator)
        
    def leave(self, member: PongSpectator | PongPlayer):
        
        if (isinstance(member, PongPlayer)):
            self._player_leave(member)
        elif (isinstance(member, PongSpectator)):
            self._spectator_leave(member)
        
        if self.model.started:
            if len(self.get_players_connected()) + len(self.spectators) == 0:
                self.stopped = True
                if hasattr(self, 'thread'):
                    self.thread.join(10)
                self.game_manager.remove(self)
    
    def _send_game_data(self, member: PongSpectator | PongPlayer):
    
        member.send("init_game", self.to_dict())
        
    def update_player(self, player: PongPlayer):
        self.broadcast("update_player", player.to_dict(), [player])

    def to_dict(self): 
        
        data: dict = {"ball": self.ball.to_dict(),
                      "players": [player.to_dict() for player in self.players],
                      "walls": [wall.to_dict() for wall in self.walls],
                      }
        
        return data