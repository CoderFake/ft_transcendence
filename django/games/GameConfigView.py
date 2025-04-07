from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from django.http import HttpRequest

from . import config

class GameConfigView(APIView):
    
    permission_classes = (permissions.AllowAny,)

    def get(self, request: HttpRequest):
        config_data = {
            "MAP_SIZE_X": config.MAP_SIZE_X,
            "MAP_SIZE_Y": config.MAP_SIZE_Y,
   
            "WALL_RATIO": config.WALL_RATIO,
   
            "PADDLE_SPEED_PER_SECOND_MAX": config.PADDLE_SPEED_PER_SECOND_MAX,
            "PADDLE_RATIO": config.PADDLE_RATIO,    
 
            "BALL_SIZE": config.BALL_SIZE,
            "BALL_SPEED_INC": config.BALL_SPEED_INC,
            "BALL_SPEED_START": config.BALL_SPEED_START,
            
            "STROKE_THICKNESS": config.STROKE_THICKNESS,
            
            "GAME_MAX_SCORE": config.GAME_MAX_SCORE,
        }
        return Response(config_data, status = status.HTTP_200_OK)