from rest_framework.serializers import Serializer, CharField
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError

class LoginSerializer(Serializer):
    
    username = CharField()
    password = CharField()

    def get_user(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        return user