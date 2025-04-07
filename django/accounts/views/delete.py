from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from django.contrib.auth import logout
from django.http import HttpRequest
from rest_framework.authentication import SessionAuthentication
from django.utils.translation import gettext as _


class DeleteView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def delete(self, request: HttpRequest):
        data: dict = request.data

        password: str = data["password"]
        if (request.user.check_password(password) is False):
            return Response({"password": _("Password incorrect.")},
                            status.HTTP_401_UNAUTHORIZED)
        request.user.delete()
        logout(request)
        return Response(status=status.HTTP_200_OK)
