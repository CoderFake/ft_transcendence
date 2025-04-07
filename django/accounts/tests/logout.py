from django.test import TestCase

from django.test.client import Client
from django.contrib.auth.models import User
from django.contrib.auth import login

class LoginTest(TestCase):
    def setUp(self):
        self.client = Client()
        
        self.url = "/api/accounts/logout"
        
        self.client.login()

    def test_normal_logout(self):
        self.client.post(self.url)
        self.assertNotIn('_auth_user_id', self.client.session)
