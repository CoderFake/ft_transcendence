from rest_framework import serializers

from django.utils.translation import gettext as _
from django.contrib.auth.models import User

from ..models import ChatChannelModel, ChatMessageModel


class ChatChannelSerializer(serializers.ModelSerializer):

    members_id = serializers.ListField(child=serializers.IntegerField(), required=True, write_only=True)
    messages = serializers.SerializerMethodField()

    class Meta:
        model = ChatChannelModel
        fields = ["members_id", "id", 'messages']

    def validate_members_id(self, value):
        members_id: [int] = value
        if len(members_id) < 2:
            raise serializers.ValidationError(_('There is not enough members to create the channel.'))
        if len(set(members_id)) != len(members_id):
            raise serializers.ValidationError(_('Duplicate in members list.'))
        if self.context.get('user').pk not in members_id:
            raise serializers.ValidationError(_('You are trying to create a group chat without you.'))
        for member_id in members_id:
            if not User.objects.filter(pk=member_id).exists():
                raise serializers.ValidationError(_(f"The profile {member_id} doesn't exist."))
        return members_id

    def get_messages(self, obj: ChatChannelModel):
        messages = ChatMessageModel.objects.filter(channel=obj).order_by('time')
        return ChatMessageSerializer(messages, many=True).data


class ChatMessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChatMessageModel
        fields = ["channel", "author", "content", "time"]
