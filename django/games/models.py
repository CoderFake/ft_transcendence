from __future__ import annotations

from django.db import models
from django.db.models import QuerySet, CASCADE

from django.contrib.auth.models import User

import time

class GameModel(models.Model):

    finished = models.BooleanField(default = False)
    started = models.BooleanField(default = False)
    winner = models.ForeignKey(User, on_delete=CASCADE, null=True, blank=True)
    start_timestamp = models.BigIntegerField(null = True, blank = True)
    stop_timestamp = models.BigIntegerField(null = True, blank = True)
    game_type = models.CharField(max_length = 60, default = "pong")
    
    def create(self, players: set[User]) -> GameModel:
        self.save()
        for player in players:
            GameMembersModel(game = self, player=player).save()
        return self

    def start(self):
        self.start_timestamp = round(time.time() * 1000, 1)
        self.started = True
        self.save()
    
    def finish(self, winner: User):
        self.winner = winner
        self.finished = True
        self.stop_timestamp = round(time.time() * 1000, 1)
        self.save()

    def get_players(self) -> list[User]:
        return [game_player.player for game_player in GameMembersModel.objects.filter(game = self)]
    
    def get_players_profiles(self) -> list[User]:
        return [game_player.player.profilemodel for game_player in GameMembersModel.objects.filter(game = self)]
    
    def get_score_by_player_id(self, player_id: int) -> list[int]:
        query: QuerySet = GameGoalModel.objects.filter(game_id = self.pk, player_id = player_id)
        score_data: list[int] = [game_goal.timestamp for game_goal in query]
        
        return score_data
    
    def add_goal(self, goal_defenser: User):
        
        timestamp: int = round(time.time() * 1000, 1) - self.start_timestamp
        
        goal_model: GameGoalModel = GameGoalModel(player=goal_defenser, game=self, timestamp=timestamp)
        
        goal_model.save()
        
        return timestamp

class GameMembersModel(models.Model):
    game = models.ForeignKey(GameModel, on_delete=CASCADE)
    player = models.ForeignKey(User, on_delete=CASCADE)
    
class GameGoalModel(models.Model):
    
    game = models.ForeignKey(GameModel, on_delete=CASCADE)
    player = models.ForeignKey(User, on_delete=CASCADE)
    timestamp = models.IntegerField()