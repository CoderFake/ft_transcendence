from __future__ import annotations
from os.path import splitext

from django.contrib.auth.models import User
from django.db.models import Q, Model, CASCADE, ForeignKey, ImageField, OneToOneField
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver


def upload_to(instance, filename: str):
    return f"./profiles/static/avatars/{instance.pk}{splitext(filename)[1]}"


class ProfileModel(Model):
    user = OneToOneField(User, on_delete=CASCADE)
    avatar = ImageField(upload_to=upload_to, default="./profiles/static/avatars/default.avif")

    def get_game(self) -> int:
        from games.consumers import game_manager
        for game in game_manager._game_list:
            for player in game.get_players_connected():
                if (player.user_id == self.user.pk):
                    return game.game_id
        return None

    def get_friends(self) -> list[ProfileModel]:
        friends: list[ProfileModel] = []

        for friendship in FriendModel.objects.filter(Q(friend1=self) | Q(friend2=self)):
            friends.append(friendship.friend1 if friendship.friend1 != self else friendship.friend2)

        return friends

    def is_friend(self, friend):
        return FriendModel.objects.filter(
            (Q(friend1=self) & Q(friend2=friend)) |
            (Q(friend2=self) & Q(friend1=friend))
        ).exists()

    def delete_friend(self, friend):
        FriendModel.objects.get(
            (Q(friend1=self) & Q(friend2=friend)) |
            (Q(friend2=self) & Q(friend1=friend))
        ).delete()

    def is_friend_requested_by(self, profile):
        return FriendRequestModel.objects.filter(author=profile, target=self).exists()

    def get_received_friend_request_from(self, profile):
        return FriendRequestModel.objects.filter(author=profile, target=self).first()

    def is_friend_requesting(self, profile):
        return FriendRequestModel.objects.filter(author=self, target=profile).exists()

    def get_outgoing_friend_request_to(self, profile):
        return FriendRequestModel.objects.filter(author=self, target=profile).first()

    def get_outgoing_friend_requests(self) -> list[ProfileModel]:
        return FriendRequestModel.objects.filter(author=self)

    def get_incoming_friend_requests(self) -> list[ProfileModel]:
        return FriendRequestModel.objects.filter(target=self)


@receiver(pre_delete, sender=ProfileModel)
def delete_profile_picture(sender, instance, **kwargs):
    if instance.avatar.name != './profiles/static/avatars/default.avif':
        instance.avatar.storage.delete(instance.avatar.name)


@receiver(post_save, sender=User)
def on_user_created(sender, instance, created, **kwargs):
    if created:
        profile: ProfileModel = ProfileModel.objects.create(pk=instance.pk, user=instance)
        profile.save()


class FriendModel(Model):
    friend1 = ForeignKey(ProfileModel, on_delete=CASCADE, related_name='friend1')
    friend2 = ForeignKey(ProfileModel, on_delete=CASCADE, related_name='friend2')


class FriendRequestModel(Model):
    author = ForeignKey(ProfileModel, on_delete=CASCADE, related_name='author')
    target = ForeignKey(ProfileModel, on_delete=CASCADE, related_name='target')

    def accept(self):
        FriendModel(friend1=self.author, friend2=self.target).save()
        self.delete()


class BlockModel(Model):
    blocker = ForeignKey(ProfileModel, on_delete=CASCADE, related_name='blocker')
    blocked = ForeignKey(ProfileModel, on_delete=CASCADE, related_name='blocked')
