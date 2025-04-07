from django.test import TestCase

# Create your tests here.
from django.test.client import Client
from django.http import HttpResponse
from django.contrib.auth.models import User

import uuid

class DeleteTest(TestCase):
    def setUp(self):
        self.client = Client()
        
        self.url = "/api/accounts/delete"
        
        self.username: str = str(uuid.uuid4())
        self.password: str = str(uuid.uuid4())

        user: User = User.objects.create_user(username=self.username, password=self.password)
        self.client.login(username=self.username, password=self.password)
        

    def test_normal_delete(self):
        response: HttpResponse = self.client.delete(self.url, {"password": self.password}, content_type='application/json')
        response_text: str = response.content.decode("utf-8")
        self.assertEqual(response_text, '"user deleted"')
    
    def test_wrong_pass(self):
        response: HttpResponse = self.client.delete(self.url, {"password": "cacaman a frapper"}, content_type='application/json')
        errors: dict = eval(response.content)
        self.assertDictEqual(errors, {"password": ["Password wrong."]})

    def test_no_logged(self):
        self.client.logout()
        response: HttpResponse = self.client.delete(self.url, {"password": self.password}, content_type='application/json')
        errors: dict = eval(response.content)
        self.assertDictEqual(errors, {"detail":"Authentication credentials were not provided."})