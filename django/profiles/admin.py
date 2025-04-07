from django.contrib import admin

from .models import ProfileModel, FriendModel, FriendRequestModel, BlockModel

# Register your models here.
admin.site.register(ProfileModel)
admin.site.register(BlockModel)
admin.site.register(FriendModel)
admin.site.register(FriendRequestModel)
