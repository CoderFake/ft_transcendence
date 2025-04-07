from django.test import TestCase

# Create your tests here.
from django.test.client import Client
from django.http import HttpResponse
from django.contrib.auth.models import User

import uuid

class EditTest(TestCase):
    def setUp(self):
        self.client = Client()
        
        self.url = "/api/accounts/edit"
        
        self.username: str = str(uuid.uuid4())
        self.password: str = str(uuid.uuid4())
        self.new_password: str = str(uuid.uuid4())
        
        User.objects.create_user(username = self.username, password = self.password)
        
    def test_normal(self):
        self.client.login(username = self.username, password = self.password)
        response: HttpResponse = self.client.patch(self.url, {"current_password": self.password, "new_password": self.new_password, "username": "Pong"}, content_type='application/json')
        response_text: str = response.content.decode('utf-8')
        self.assertEqual(response_text, '"data has been alterate"')
    
    def test_invalid_current_password(self):
        self.client.login(username = self.username, password = self.password)
        response: HttpResponse = self.client.patch(self.url, {"current_password": "Pong", "new_password": self.new_password, "username": "Pong"}, content_type='application/json')
        errors: dict = eval(response.content)
        self.assertDictEqual(errors, {"current_password":["Password is wrong."]})

    def test_invalid_new_username_blank(self):
        self.client.login(username = self.username, password = self.password)
        response: HttpResponse = self.client.patch(self.url, {"current_password": self.password, "username": " "}, content_type='application/json')
        errors: dict = eval(response.content)
        self.assertDictEqual(errors, {'username': ['This field may not be blank.']})

    def test_invalid_new_username_char(self):
        self.client.login(username = self.username, password = self.password)
        response: HttpResponse = self.client.patch(self.url, {"current_password": self.password, "username": "*&"}, content_type='application/json')
        errors: dict = eval(response.content)
        self.assertDictEqual(errors, {'username': ['Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.']})

    def test_nologged(self):
        response: HttpResponse = self.client.patch(self.url, {"current_password": self.password, "new_password": self.new_password}, content_type='application/json')
        errors: dict = eval(response.content)
        self.assertDictEqual(errors, {'detail': 'Authentication credentials were not provided.'})