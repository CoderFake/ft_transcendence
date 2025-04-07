from django.test import TestCase

# Create your tests here.
from rest_framework import status
from django.test.client import Client
from django.contrib.auth.models import User
from django.http import HttpResponse
import uuid

class RegisterTest(TestCase):
    def setUp(self):
        self.client = Client()

        self.url: str = "/api/accounts/register"

        self.username: str = str(uuid.uuid4())
        self.password: str = str(uuid.uuid4())

    def test_normal_register(self):
        response: HttpResponse = self.client.post(self.url, {'username': self.username, 'password': self.password})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_incomplet_form_no_username_no_password(self):
        response: HttpResponse = self.client.post(self.url)
        errors: dict = eval(response.content)
        errors_expected: dict = {'username': ['This field is required.'], 'password': ['This field is required.']}
        self.assertEqual(errors, errors_expected)

    def test_incomplet_form_no_password(self):
        response: HttpResponse = self.client.post(self.url,  {"username": self.username})
        errors: dict = eval(response.content)
        errors_expected: dict = {'password': ['This field is required.']}
        self.assertEqual(errors, errors_expected)

    def test_incomplet_form_no_username(self):
        response: HttpResponse = self.client.post(self.url,  {"password": self.password})
        errors: dict = eval(response.content)
        errors_expected: dict = {}
        self.assertEqual(errors, errors_expected)
    
    def test_incomplet_form_no_username(self):
        response: HttpResponse = self.client.post(self.url,  {"password": self.password})
        errors: dict = eval(response.content)
        errors_expected: dict = {'username': ['This field is required.']}
        self.assertEqual(errors, errors_expected)

    def test_already_registered(self):
        User(username=self.username, password=self.password).save()
        response: HttpResponse = self.client.post(self.url, {'username': self.username, 'password': self.password})
        errors: dict = eval(response.content)
        errors_expected: dict = {'username': ['A user with that username already exists.']}
        self.assertEqual(errors, errors_expected)