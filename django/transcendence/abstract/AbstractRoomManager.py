from .AbstractRoom import AbstractRoom

class AbstractRoomManager:

    def __init__(self):
        self._room_list: list[AbstractRoom] = []

    def remove(self, room: AbstractRoom) -> None:
        self._room_list.remove(room)

    def append(self, room: AbstractRoom) -> None:
        self._room_list.append(room)
