from rest_framework.views import APIView
from django.contrib.auth import logout
from rest_framework import permissions, status
from rest_framework.response import Response
from django.http import HttpRequest
from rest_framework.authentication import SessionAuthentication


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request: HttpRequest):
        logout(request)
        return Response("user logged out", status.HTTP_200_OK)
