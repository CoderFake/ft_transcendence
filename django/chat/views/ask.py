from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import SessionAuthentication

from chat.models import AskModel
from games.models import GameModel

from notice.consumers import notice_manager

from django.contrib.auth.models import User


class AskView(APIView):

    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        data: dict = request.data

        asker_id = request.user.pk
        asked_id = data.get("asked")

        if (asked_id is None):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if AskModel().is_asked(asker_id, asked_id):
            return Response(status=status.HTTP_208_ALREADY_REPORTED)

        asked = User.objects.get(pk=asked_id)

        notice_manager.ask_game(asked, request.user.username)

        AskModel(asker_id=asker_id, asked_id=asked_id).save()
        return Response(status=status.HTTP_201_CREATED)

    def delete(self, request):
        data: dict = request.data

        asker_id = data.get("asker")
        asked_id = request.user.pk

        if (asker_id is None):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if not AskModel().is_asked(asker_id, asked_id):
            return Response(status=status.HTTP_204_NO_CONTENT)

		# Don't need more verification, just above is enough
        asker = User.objects.get(pk=asker_id)

        notice_manager.refuse_game(asker, request.user.username)

        AskModel.objects.get(asker_id=asker_id, asked_id=asked_id).delete()

        return Response(status=status.HTTP_200_OK)

    def get(self, request, pk=None):
        data: dict = request.data

        asker_id = request.user.pk
        asked_id = pk

        if (asked_id is None):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if not AskModel().is_asked(asked_id, asker_id):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_200_OK)

class AskAcceptView(APIView):

    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):

        data: dict = request.data

        asker_id = data.get("asker")
        asked_id = request.user.pk

        if (asker_id is None):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if not AskModel().is_asked(asker_id, asked_id):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        asker = User.objects.get(pk=asker_id)
        asked = request.user

        id_game = GameModel(game_type="pong").create([asker, asked]).pk

        notice_manager.accept_game(asker, request.user.username, id_game)

        AskModel.objects.get(asker_id=asker_id, asked_id=asked_id).delete()
        return Response({"id_game":id_game}, status=status.HTTP_200_OK)
