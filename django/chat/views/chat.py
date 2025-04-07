from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication

from django.contrib.auth.models import User

from ..models import ChatChannelModel, ChatMemberModel
from ..serializers.chat import ChatChannelSerializer


class ChannelView(APIView):

    serializer_class = ChatChannelSerializer
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'user': request.user})
        serializer.is_valid(raise_exception=True)

        members_id = serializer.validated_data.get('members_id')
        member_list = [User.objects.get(pk=member_id) for member_id in members_id]

        for member_channel in ChatMemberModel.objects.filter(member=member_list[0]):
            channel: ChatChannelModel = member_channel.channel
            if set(channel.get_members()) == set(member_list):
                break
        else:
            channel = ChatChannelModel().create(member_list)
        return Response(self.serializer_class(channel).data)
