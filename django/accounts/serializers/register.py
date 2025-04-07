from rest_framework.serializers import ModelSerializer 
from django.contrib.auth.models import User

class RegisterSerialiser(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        
    def create(self, data):
        user_obj = User.objects.create_user(username=data['username'], password=data['password'])
        user_obj.save()
        return user_obj