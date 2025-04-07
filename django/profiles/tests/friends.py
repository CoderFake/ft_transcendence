from django.test import TestCase
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework import status

from profiles.serializers.ProfileSerializer import ProfileSerializer
from profiles.models.ProfileModel import ProfileModel


class FriendTest(TestCase):
    def setUp(self):
        self.user_password = 'hello_world'
        self.user: User = User.objects.create_user('blocker', password=self.user_password)
        self.friend_password = "password"
        self.friend: User = User.objects.create_user('blocked', password=self.friend_password)
        self.user.save()
        self.friend.save()
        self.user_profile = ProfileModel.objects.get(user=self.user)
        self.friend_profile = ProfileModel.objects.get(user=self.friend)


    def test_normal(self):
        self.client.login(username=self.user.username, password=self.user_password)

        response: HttpResponse = self.client.post(f'/api/profiles/friends/{self.friend.pk}')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get('/api/profiles/friends')
        self.assertListEqual(response.json(), [ProfileSerializer(self.friend_profile).data])

        self.client.login(username=self.friend.username, password=self.friend_password)

        response = self.client.get('/api/profiles/friends')
        self.assertListEqual(response.json(), [ProfileSerializer(self.user_profile).data])
    
    def test_yourself(self):
        self.client.login(username=self.user.username, password=self.user_password)

        response: HttpResponse = self.client.post(f'/api/profiles/friends/{self.user.pk}')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.get('/api/profiles/friends')
        self.assertListEqual(response.json(), [])
        
    def test_user_not_found(self):
        self.client.login(username=self.user.username, password=self.user_password)

        response: HttpResponse = self.client.post(f'/api/profiles/friends/32')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.client.get('/api/profiles/friends')
        self.assertListEqual(response.json(), [])