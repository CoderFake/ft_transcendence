from django.test import TestCase
from django.http import HttpResponse
from django.contrib.auth.models import User


class ProfileTest(TestCase):
    def setUp(self):
        self.user: User = User.objects.create_user('Pong', password='password')
        self.user.save()
        self.expected_response = {'avatar': '/static/avatars/default.avif', 'user_id': 1, 'username': 'Pong'}

        self.url = "/api/profiles/user/"

    def test_profile_create_on_user_created(self):
        response: HttpResponse = self.client.get(self.url + self.user.username)
        self.assertDictEqual(self.expected_response, response.json())
