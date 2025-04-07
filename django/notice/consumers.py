from __future__ import annotations
import json

from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import User

from profiles.serializers import ProfileSerializer
from profiles.models import ProfileModel
from .models import NoticeModel


class NoticeManager:
    def __init__(self):
        self._list: list[NoticeConsumer] = []

    def add(self, consumer: NoticeConsumer):
        self._list.append(consumer)

        unsend_notices = NoticeModel.objects.filter(user=consumer.user)
        for notice in unsend_notices:
            consumer.send(notice.data)
            notice.delete()

        for friend in consumer.user.profilemodel.get_friends():
            self.notify_user(friend.user, {'type': 'online',
                                           'user': ProfileSerializer(consumer.user.profilemodel).data})

    def remove(self, consumer: NoticeConsumer):
        if consumer.user.is_authenticated:
            for friend in consumer.user.profilemodel.get_friends():
                self.notify_user(friend.user, {'type': 'offline',
                                               'user': ProfileSerializer(consumer.user.profilemodel).data})
        self._list.remove(consumer)

    def get_consumer_by_user(self, user: User):
        for consumer in self._list:
            if consumer.user == user:
                return consumer

    def notify_user(self, user: User, data: dict):
        consumer = self.get_consumer_by_user(user)
        data_str: str = json.dumps(data)
        if consumer:
            consumer.send(data_str)
        else:
            NoticeModel(user=user, data=data_str).save()

    def notify_friend_request(self, user: User, friend: ProfileModel):
        self.notify_user(user, {'type': 'friend_request', 'author': ProfileSerializer(friend).data})

    def notify_friend_request_canceled(self, user: User, friend: ProfileModel):
        self.notify_user(user, {'type': 'friend_request_canceled', 'author': ProfileSerializer(friend).data})

    def notify_new_friend(self, user: User, friend: ProfileModel):
        serialized_data = ProfileSerializer(friend).data
        if self.get_consumer_by_user(user) is not None:
            status = 'online'
        else:
            status = 'offline'
        print(status)

        self.notify_user(user, {'type': 'new_friend', 'friend': serialized_data})
        self.notify_user(user, {'type': 'online', 'user': serialized_data})
        self.notify_user(friend.user, {'type': status, 'user': ProfileSerializer(user.profilemodel).data})

    def notify_friend_removed(self, user: User, friend: ProfileModel):
        self.notify_user(user, {'type': 'friend_removed', 'friend': ProfileSerializer(friend).data})

    def ask_game(self, asked:User, asker: str):
        self.notify_user(asked, {'type': 'game_asked', 'asker': asker})

    def refuse_game(self, asker: User, asked: str):
        self.notify_user(asker, {'type': 'game_refused', 'asked': asked})

    def accept_game(self, asker: User, asked: str, id_game):
        self.notify_user(asker, {'type': 'game_accepted', 'asked': asked, 'id_game': id_game})

notice_manager = NoticeManager()


class NoticeConsumer(WebsocketConsumer):
    def connect(self):
        self.user: User = self.scope['user']
        if not self.user.is_authenticated:
            self.close()
            return

        self.accept()
        notice_manager.add(self)

    def disconnect(self, code):
        if self.scope['user'].is_authenticated:
            notice_manager.remove(self)
        super().disconnect(code)
