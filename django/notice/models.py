from django.db.models import Model, ForeignKey, CharField, CASCADE
from django.contrib.auth.models import User


class NoticeModel(Model):
    user = ForeignKey(User, on_delete=CASCADE)
    data = CharField(max_length=1024)
