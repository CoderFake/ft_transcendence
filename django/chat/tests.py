from django.test import TestCase

from django.test.client import Client
from django.http import HttpResponse, HttpRequest
from django.contrib.auth.models import User

# Create your tests here.
class ChatTest(TestCase):
    def setUp(self):
        self.client = Client()

        self.username='Pong1'
        self.password='password'

        self.user: User = User.objects.create_user(username=self.username, password=self.password)

        self.dest: User = User.objects.create_user(username="Pong2", password=self.password)

        self.url = "/api/chat/"

    def test_create_chat(self):
        self.client.login(username=self.username, password=self.password)
        response: HttpResponse = self.client.post(self.url + str(self.user.pk), {"members_id": [self.user.pk, self.dest.pk]})
        response_dict: dict = eval(response.content)
        self.assertDictEqual(response_dict, {})

    def test_create_chat_unlogged(self):
        response: HttpResponse = self.client.post(self.url + str(self.user.pk), {"members_id": [self.user.pk, self.dest.pk]})
        response_dict: dict = eval(response.content)
        self.assertDictEqual(response_dict,  {'detail': 'Authentication credentials were not provided.'})
