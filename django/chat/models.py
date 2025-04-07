from django.db.models import BigIntegerField, Model, IntegerField, ForeignKey, CharField, CASCADE
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User


class ChatChannelModel(Model):
    def create(self, members: [User]):
        self.save()
        for member in members:
            ChatMemberModel(channel=self, member=member).save()
        return self

    def get_members(self):
        return [member_channel.member for member_channel in ChatMemberModel.objects.filter(channel=self)]


class ChatMemberModel(Model):
    member = ForeignKey(User, on_delete=CASCADE)
    channel = ForeignKey(ChatChannelModel, on_delete=CASCADE)


@receiver(post_delete, sender=ChatMemberModel)
def delete_channel_when_member_deleted(sender, instance, **kwargs):
    print(sender, instance)


class ChatMessageModel(Model):
    channel = ForeignKey(ChatChannelModel, on_delete=CASCADE)
    author = ForeignKey(User, on_delete=CASCADE)
    content = CharField(max_length=1024)
    time = BigIntegerField(primary_key=False)


class AskModel(Model):
    asker_id = IntegerField(primary_key=False)
    asked_id = IntegerField(primary_key=False)

    # return if the asker ask the asked to play a game
    def is_asked(self, asker_id, asked_id):
        return AskModel.objects.filter(asker_id=asker_id, asked_id=asked_id).first() is not None
