from django.conf import settings
from django.utils.translation import gettext as _

from rest_framework import serializers

from .models import ProfileModel


class ProfileSerializer(serializers.ModelSerializer):

    username = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.ImageField(required=False)
    online = serializers.SerializerMethodField()
    is_friend = serializers.SerializerMethodField()
    has_incoming_request = serializers.SerializerMethodField()
    has_outgoing_request = serializers.SerializerMethodField()

    class Meta:
        model = ProfileModel
        fields = ["username", "avatar", "id", 'online', 'is_friend',
                  'has_outgoing_request', 'has_incoming_request']

    def get_online(self, obj: ProfileModel):
        from notice.consumers import notice_manager

        user = self.context.get('user')
        if user is None or not user.is_authenticated:
            return None

        if not user.profilemodel.is_friend(obj) and user.pk != obj.pk:
            return None

        return notice_manager.get_consumer_by_user(obj.user) is not None

    def get_is_friend(self, obj: ProfileModel):
        user = self.context.get('user')
        if user is None or not user.is_authenticated or user.pk == obj.pk:
            return False

        return obj.is_friend(user.profilemodel)

    def get_has_incoming_request(self, obj: ProfileModel):
        user = self.context.get('user')
        if user is None or not user.is_authenticated or user.pk == obj.pk:
            return False

        return obj.is_friend_requesting(user.profilemodel)

    def get_has_outgoing_request(self, obj: ProfileModel):
        user = self.context.get('user')
        if user is None or not user.is_authenticated or user.pk == obj.pk:
            return False

        return obj.is_friend_requested_by(user.profilemodel)

    def validate_avatar(self, value):
        '''
        Check that the image is not too large
        '''
        if value.size > settings.PROFILE_PICTURE_MAX_SIZE:
            raise serializers.ValidationError(_('Image is too large.'))
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = data['avatar'][data['avatar'].find('/static/'):]
        return data
