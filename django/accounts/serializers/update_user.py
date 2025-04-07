from rest_framework.serializers import ModelSerializer, ValidationError
from django.contrib.auth.models import User
from django.utils.translation import gettext as _


class UpdateUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username']

    def update(self, instance, validated_data):
        user = self.context['request'].user

        if user.pk != instance.pk:
            raise ValidationError({'authorize': _('You dont have permission for this user.')})

        instance.username = validated_data.get('username', instance.username)

        instance.save()
        return instance
