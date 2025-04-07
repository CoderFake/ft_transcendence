from __future__ import annotations

from channels.generic.websocket import WebsocketConsumer

from .AbstractRoomMember import AbstractRoomMember

from django.contrib.auth.models import User

from profiles.models import ProfileModel

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .AbstractRoomManager import AbstractRoomManager

class AbstractRoom:
    
    def __init__(self, room_manager: AbstractRoomManager):
        self._member_list: set[AbstractRoomMember] = set()
        self._room_manager: AbstractRoomManager = room_manager

    def broadcast(self, detail: str, data: dict = {}, excludes: set[AbstractRoomMember] = set()) -> None:

        members: set[AbstractRoomMember] = self._member_list - excludes

        for member in members:
            member.send(detail, data)

    def get_member_by_socket(self, socket: WebsocketConsumer) -> AbstractRoomMember | None:

        for member in self._member_list:
            if member.socket is socket:
                return member

    def get_member_by_user(self, user: User) -> AbstractRoomMember:

        for member in self._member_list:
            if member.user == user:
                return member
    
    def get_members_profiles(self) -> set[ProfileModel]:
        return set(member.user.profilemodel for member in self._member_list)
    
    def get_members(self) -> set[ProfileModel]:
        return set(member.user for member in self._member_list)

    def append(self, member: AbstractRoomMember) -> None:
        self._member_list.add(member)

    def remove(self, member: AbstractRoomMember) -> None:
        self._member_list.remove(member)

    def get_users(self) -> set[User]:
        return set(member.user for member in self._member_list)

    def __len__(self) -> int:
        return len(self._member_list)
