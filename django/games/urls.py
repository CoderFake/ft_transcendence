from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static

from .GameViewSet import GameViewSet
from .GameHistoryViewSet import GameHistoryView
from .GameConfigView import GameConfigView

urlpatterns = [
    path("<int:pk>", GameViewSet.as_view({"get": "retrieve"}), name="game_page"),
    path("history/<int:pk>", GameHistoryView.as_view({"get": "retrive"}), name="history_page"),
    path("", GameConfigView.as_view(), name = "game_config")
]