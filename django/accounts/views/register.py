from rest_framework import permissions, status
from ..serializers.register import RegisterSerialiser
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpRequest
from django.contrib.auth import login


class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request: HttpRequest):
        data = request.data
        serializer = RegisterSerialiser(data=data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(data)
            if user:
                login(request, user)
                return Response("user created", status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)
