from django.test import TestCase

# Create your tests here.
from django.test.client import Client
from django.contrib.auth.models import User
from django.http import HttpResponse
import uuid

class LoginTest(TestCase):
    def setUp(self):
        self.client = Client()
        
        self.url = "/api/accounts/login"
        
        self.username: str = str(uuid.uuid4())
        self.password: str = str(uuid.uuid4())

        User.objects.create_user(username=self.username, password=self.password)
    
    def test_normal_login(self):
        response: HttpResponse = self.client.post(self.url, {'username': self.username, 'password': self.password})
        response_text = response.content.decode('utf-8')
        #self.assertEqual(response_text, 'user connected')

    def test_invalid_username(self):
        response: HttpResponse = self.client.post(self.url,  {"username": self.password, "password": self.password})
        errors: dict = eval(response.content)
        errors_expected: dict = {'user': ['Username or password wrong.']}
        self.assertEqual(errors, errors_expected)

    def test_invalid_password(self):
        response: HttpResponse = self.client.post(self.url,  {"username": self.username, "password": self.username})
        errors: dict = eval(response.content)
        errors_expected: dict = {'user': ['Username or password wrong.']}
        self.assertEqual(errors, errors_expected)
        
    def test_invalid_no_username(self):
        response: HttpResponse = self.client.post(self.url,  {"password": self.password})
        errors: dict = eval(response.content)
        errors_expected: dict = {'username': ['This field is required.']}
        self.assertEqual(errors, errors_expected)

    def test_invalid_no_password(self):
        response: HttpResponse = self.client.post(self.url,  {"username": self.username})
        errors: dict = eval(response.content)
        errors_expected: dict = {'password': ['This field is required.']}
        self.assertEqual(errors, errors_expected)

    def test_invalid_no_password_no_username(self):
        response: HttpResponse = self.client.post(self.url,  {})
        errors: dict = eval(response.content)
        errors_expected: dict = {'username': ['This field is required.'], 'password': ['This field is required.']}
        self.assertEqual(errors, errors_expected)
