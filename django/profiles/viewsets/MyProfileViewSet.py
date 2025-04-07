from rest_framework import permissions
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication

from ..serializers import ProfileSerializer
from ..models import ProfileModel


class MyProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    serializer_class = ProfileSerializer
    queryset = ProfileModel.objects.all()

    def get_object(self):
        return self.request.user.profilemodel

    def perform_update(self, serializer: ProfileSerializer, pk=None):
        serializer.is_valid(raise_exception=True)
        avatar = serializer.validated_data.get('avatar')
        profile: ProfileModel = self.get_object()

        if (avatar is not None):
            if (profile.avatar.name != "./profiles/static/avatars/default.avif"):
                profile.avatar.storage.delete(profile.avatar.name)
            serializer.save()

    def delete_avatar(self, pk=None):
        profile = self.get_object()
        if (profile.avatar.name != './profiles/static/avatars/default.avif'):
            profile.avatar.storage.delete(profile.avatar.name)
        profile.avatar.name = './profiles/static/avatars/default.avif'
        profile.save()
        return Response(ProfileSerializer(profile).data)

    def retrieve(self, pk=None):
        return Response(self.serializer_class(self.get_object(), context={'user': self.request.user}).data)
