from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .models import ChatMemberModel, ChatMessageModel

import time
import json


class ChatConsumer(WebsocketConsumer):

    def connect(self):

        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            return

        self.channel_id: int = int(self.scope['url_route']['kwargs']['chat_id'])

        if not ChatMemberModel.objects.filter(member_id=self.user.pk, channel_id=self.channel_id).exists():
            return

        if self.channel_layer is None:
            return

        self.room_group_name = f'chat{self.channel_id}'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def receive(self, text_data=None, bytes_data=None):
        if text_data is None:
            return

        user = self.scope["user"]
        if (user.is_anonymous or not user.is_authenticated):
            return

        text_data_json: dict = json.loads(text_data)

        message = text_data_json.get('message')
        if message is None:
            return

        message_time: int = int(time.time() * 1000)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'author_id': user.pk,
                'content': message,
                'time': message_time,
            }
        )

        ChatMessageModel(
            channel_id=self.channel_id,
            author_id=user.pk,
            content=message,
            time=message_time
        ).save()

    def chat_message(self, event):
        self.send(text_data=json.dumps({
            'type': 'chat',
            'author_id': event['author_id'],
            'content': event['content'],
            'time': event['time'],
        }))
