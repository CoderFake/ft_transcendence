from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import SessionAuthentication

from django.http import HttpRequest
from django.db.models import QuerySet

from .models import GameModel
from .serializers import GameSerializer

# Create your views here.
class GameViewSet(viewsets.ModelViewSet):

    queryset = GameModel.objects
    serializer_class = GameSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def retrieve(self, request: HttpRequest, pk):

        if (not self.queryset.filter(pk = pk).exists()):
            return Response({"detail": "Game not found."}, status=status.HTTP_404_NOT_FOUND)

        game = self.queryset.get(pk = pk)

        return Response(self.serializer_class(game).data, status=status.HTTP_200_OK)