from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import permissions

from django.http import HttpRequest
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import GameMembersModel, GameModel
from .serializers import GameSerializer

class GameHistoryView(ViewSet):
    
    queryset = User.objects.all()
    serializer_class = GameSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def retrive(self, request: HttpRequest, pk: int = None):
        
        user: User = get_object_or_404(User, pk=pk)
        
        member_game_model_list: list[GameMembersModel] = GameMembersModel.objects.filter(player=user)
        
        game_model_list: list[GameModel] = [member_game_model.game for member_game_model in member_game_model_list]
        
        games_data: list[dict] = self.serializer_class(game_model_list, many=True).data
        
        return Response(games_data)