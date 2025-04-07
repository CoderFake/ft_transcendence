from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.http import HttpRequest
from rest_framework.authentication import SessionAuthentication


class LoggedView(APIView):

    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request: HttpRequest):
        return Response(status=status.HTTP_200_OK if request.user.is_authenticated else status.HTTP_400_BAD_REQUEST)
