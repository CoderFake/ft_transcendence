from django.test import TestCase
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework import status

from profiles.serializers.ProfileSerializer import ProfileSerializer
from profiles.models.ProfileModel import ProfileModel


class BlockTest(TestCase):
    def setUp(self):
        self.blocker_password = 'hello_world'
        self.blocker: User = User.objects.create_user('blocker', password=self.blocker_password)
        self.blocked: User = User.objects.create_user('blocked', password='password')
        self.blocker.save()
        self.blocked.save()

    def test_normal(self):
        self.client.login(username=self.blocker.username, password=self.blocker_password)
        response: HttpResponse = self.client.post(f'/api/profiles/block/{self.blocked.pk}')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        blocked_profile = ProfileModel.objects.get(user=self.blocked)

        response = self.client.get('/api/profiles/block')
        self.assertListEqual(response.json(), [ProfileSerializer(blocked_profile).data])
    
    def test_yourself(self):
        self.client.login(username=self.blocker.username, password=self.blocker_password)
        response: HttpResponse = self.client.post(f'/api/profiles/block/{self.blocker.pk}')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.get('/api/profiles/block')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(response.json(), [])
        
    def test_user_not_found(self):
        self.client.login(username=self.blocker.username, password=self.blocker_password)
        response: HttpResponse = self.client.post(f'/api/profiles/block/23')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.client.get('/api/profiles/block')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(response.json(), [])