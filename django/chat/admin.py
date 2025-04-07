from django.contrib import admin
from .models import ChatChannelModel, ChatMemberModel, ChatMessageModel

admin.site.register(ChatChannelModel)
admin.site.register(ChatMemberModel)
admin.site.register(ChatMessageModel)
