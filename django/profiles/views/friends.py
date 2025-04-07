from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import SessionAuthentication

from django.utils.translation import gettext as _
from django.shortcuts import get_object_or_404

from ..models import ProfileModel, FriendRequestModel
from ..serializers import ProfileSerializer
from notice.consumers import notice_manager


class GetFriendsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        return Response(ProfileSerializer(request.user.profilemodel.get_friends(), many=True).data)


class EditFriendView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get_object(self):
        return self.request.user.profilemodel

    def post(self, request, pk=None):
        user_profile: ProfileModel = self.get_object()
        friend_profile = get_object_or_404(ProfileModel, pk=pk)

        if user_profile.pk == pk:
            return Response(_('You can\'t be friend with yourself.'), status.HTTP_400_BAD_REQUEST)

        if user_profile.is_friend(friend_profile):
            return Response(_('You are already friend with this user.'), status.HTTP_400_BAD_REQUEST)

        if user_profile.is_friend_requesting(friend_profile):
            return Response(_('You already sent a request to this user.'), status.HTTP_400_BAD_REQUEST)

        incoming_request = user_profile.get_received_friend_request_from(friend_profile)
        if incoming_request:
            incoming_request.accept()
            notice_manager.notify_new_friend(friend_profile.user, user_profile)
            return Response(_('Friendship successfully created.'), status.HTTP_201_CREATED)

        FriendRequestModel(author=user_profile, target=friend_profile).save()
        notice_manager.notify_friend_request(friend_profile.user, user_profile)
        return Response(_('Friend request sent.'), status.HTTP_200_OK)

    def delete(self, request, pk=None):
        user_profile = self.get_object()
        friend_profile = get_object_or_404(ProfileModel, pk=pk)

        outgoing_request = user_profile.get_outgoing_friend_request_to(friend_profile)
        if outgoing_request:
            outgoing_request.delete()
            notice_manager.notify_friend_request_canceled(friend_profile.user, user_profile)
            return Response(_('Friend request cancelled.'))

        if not user_profile.is_friend(friend_profile):
            return Response(_('You are not friend with this user.'), status.HTTP_400_BAD_REQUEST)

        user_profile.delete_friend(friend_profile)
        notice_manager.notify_friend_removed(friend_profile.user, user_profile)
        return Response(_('Friendship successfully deleted.'), status.HTTP_201_CREATED)


class GetIncomingFriendRequestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        requests = request.user.profilemodel.get_incoming_friend_requests()
        profiles = [request.author for request in requests]
        return Response(ProfileSerializer(profiles, many=True).data)


class GetOutgoingFriendRequestView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        requests = request.user.profilemodel.get_outgoing_friend_requests()
        profiles = [request.target for request in requests]
        return Response(ProfileSerializer(profiles, many=True).data)
