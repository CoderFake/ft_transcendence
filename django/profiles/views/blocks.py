from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.request import Request

from django.utils.translation import gettext as _
from django.shortcuts import get_object_or_404

from ..models import BlockModel, ProfileModel
from ..serializers import ProfileSerializer


class GetBlocksView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request: Request):
        blocks = BlockModel.objects.filter(blocker=request.user.profilemodel)
        bloked_profiles = [block.blocked for block in blocks]

        return Response(ProfileSerializer(bloked_profiles, many=True).data)


class EditBlocksView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get_object(self):
        return self.request.user.profilemodel

    def post(self, request, pk=None):
        user_profile = self.get_object()
        blocked_profile = get_object_or_404(ProfileModel, pk=pk)

        if user_profile.pk == pk:
            return Response(_('You can\'t block yourself.'), status.HTTP_400_BAD_REQUEST)

        if BlockModel.objects.filter(blocker=user_profile, blocked=blocked_profile):
            return Response(_('You already blocked this user.'), status.HTTP_409_CONFLICT)

        BlockModel(blocker=user_profile, blocked=blocked_profile).save()
        return Response(_('User successfully blocked.'), status.HTTP_201_CREATED)

    def delete(self, request, pk=None):
        user_profile = self.get_object()
        blocked_profile = get_object_or_404(ProfileModel, pk=pk)

        if user_profile.pk == pk:
            return Response(_('You can\'t unblock yourself.'), status.HTTP_400_BAD_REQUEST)

        block_record = BlockModel.objects.filter(blocker=user_profile, blocked=blocked_profile).first()
        if not block_record:
            return Response(_('This user is not blocked.'), status.HTTP_400_BAD_REQUEST)

        block_record.delete()
        return Response(_('User successfully unblocked.'), status.HTTP_200_OK)
