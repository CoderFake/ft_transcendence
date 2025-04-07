from django.urls import path

from .viewsets.ProfileViewSet import ProfileViewSet
from .viewsets.MyProfileViewSet import MyProfileViewSet
from .views.blocks import GetBlocksView, EditBlocksView
from .views.friends import (GetFriendsView,
                            EditFriendView,
                            GetIncomingFriendRequestView,
                            GetOutgoingFriendRequestView)

urlpatterns = [
    path("settings", MyProfileViewSet.as_view({'patch': 'partial_update', 'delete': 'delete_avatar'}), name="my_profile_page"),
    path("me", MyProfileViewSet.as_view({'get': 'retrieve'}), name="my_profile_page"),
    path("", ProfileViewSet.as_view({'get': 'list'}), name="profiles_list"),
    path("block", GetBlocksView.as_view(), name="block_page"),
    path("block/<int:pk>", EditBlocksView.as_view(), name="block_page"),
    path("friends", GetFriendsView.as_view(), name="friends_list_page"),
    path("friends/<int:pk>", EditFriendView.as_view(), name="friends_edit_page"),
    path("incoming_friend_requests", GetIncomingFriendRequestView.as_view(), name="incoming_friend_requests"),
    path("outgoing_friend_requests", GetOutgoingFriendRequestView.as_view(), name="outgoing_friend_requests"),
    path("user/<str:username>", ProfileViewSet.as_view({'get': 'retrieve'}), name="profile_page"),
    path("id/<int:pk>", ProfileViewSet.as_view({'get': 'retrieve_id'}), name="profile_page"),
]
