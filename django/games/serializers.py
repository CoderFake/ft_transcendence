from rest_framework import serializers

from django.contrib.auth.models import User
from django.db.models import QuerySet

from .models import GameModel
from profiles.serializers import ProfileSerializer

class GameSerializer(serializers.ModelSerializer):

    players = serializers.SerializerMethodField()
    winner = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    started = serializers.ReadOnlyField()
    finished = serializers.ReadOnlyField()
    start_timestamp = serializers.ReadOnlyField()
    stop_timestamp = serializers.ReadOnlyField()
    game_type = serializers.ReadOnlyField()

    class Meta:
        model = GameModel
        fields = ["id", "winner", "state", "started", "finished", "players", "start_timestamp", "stop_timestamp", "game_type"]

    def get_state(self, instance: GameModel):
        if (instance.finished):
            return "finished"
        if (instance.started):
            return "started"
        return "waiting"

    def get_winner(self, instance: GameModel):
        if (instance.winner is None):
            return None
        return ProfileSerializer(instance.winner.profilemodel).data

    def get_players(self, instance: GameModel):
        return ProfileSerializer(instance.get_players_profiles(), many=True).data
