from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.http import HttpRequest
from django.contrib.auth import login
from rest_framework.authentication import SessionAuthentication
from django.utils.translation import gettext as _

from ..serializers.login import LoginSerializer


class LoginView(APIView):

    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request: HttpRequest):
        data = request.data
        serializer = LoginSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.get_user(data)
        if user is None:
            return Response({'login': [_('Invalid username or password.')]}, status.HTTP_401_UNAUTHORIZED)
        login(request, user)
        return Response({'id': user.pk}, status=status.HTTP_200_OK)
