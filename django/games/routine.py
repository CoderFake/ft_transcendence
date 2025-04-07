from __future__ import annotations

from .objects.pong.Segment import Segment
from .objects.pong.Point import Point
from .objects.pong.Ball import Ball
from .objects.pong.PongPlayer import PongPlayer

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .objects.pong.PongGame import PongGame

from . import config

import asyncio

import math

from asgiref.sync import SyncToAsync


VERTICALLY = 1
NORMAL = 2

def identify(segment: Segment) -> str:
    
    if (segment.start.x == segment.stop.x):
        return VERTICALLY
    return NORMAL


def get_sign(num: float) -> int:
    if (num == 0):
        return 0
    if (num > 0):
        return 1
    if (num < 0):
        return -1

def get_intercept(derive: float, point: Point) -> float:
    
    if (derive is None):
        return None
    
    return point.y - (point.x * derive)


def get_derive(segment: Segment) -> float | None:
    
    if (segment.start.x == segment.stop.x):
        return None
    
    return (segment.stop.y - segment.start.y) / (segment.stop.x - segment.start.x)

def get_ball_segment(ball: Ball) -> tuple[Segment, float, float]:
    
    cos: float = round(math.cos(ball.angle), 6)
    #                                 invert because mathematical y coordinate and computor science y coordinate are opposed, y = 5 is above y = 10
    sin: float = round(math.sin(ball.angle)) * -1
    
    inc_x: float = (-1) * get_sign(cos) * (config.STROKE_THICKNESS + config.BALL_SIZE / 2)
    inc_y: float = get_sign(sin) * (config.STROKE_THICKNESS + config.BALL_SIZE / 2)

    ball_segment: tuple[Segment, float, float] = (Segment(ball.position.location, Point(ball.position.location.x + inc_x, ball.position.location.y + inc_y)), inc_x, inc_y)
    
    return ball_segment

def get_constant(segment: Segment) -> float:
    
    return segment.start.x

def get_impact_point(segment: Segment, ball_segment: Segment) -> Point | None:
    
    if identify(segment) == VERTICALLY and identify(ball_segment) == VERTICALLY:
        
        return None
    
    # because of in matematics world y = 10 is above y = 5 and on a display it is inverted I invert the coordonate
    
    inverted_segment = Segment(Point(segment.start.x, config.MAP_SIZE_Y - segment.start.y), Point(segment.stop.x, config.MAP_SIZE_Y - segment.stop.y))
    inverted_ball_segment = Segment(Point(ball_segment.start.x, config.MAP_SIZE_Y - ball_segment.start.y), Point(ball_segment.stop.x, config.MAP_SIZE_Y - ball_segment.stop.y))

    y: float
    x: float
    
    if (identify(segment) == NORMAL and identify(ball_segment) == NORMAL):
        
        # representation m * x + p

        m1 = get_derive(inverted_segment)
        m2 = get_derive(inverted_ball_segment)
        
        p1 = get_intercept(m1, inverted_segment.start)
        p2 = get_intercept(m2, inverted_ball_segment.start)
        
        # m1 * x + p1 = m2 * x + p2
        # m1 * x = m2 * x + p2 -p1
        # m1 * x - m2 * x = p1 - p2
        # x * (m1 - m2) = p1 - p2
        # x = (p1 - p2) / (m1 - m2)
        if (m1 == m2):
            return None
        
        #                                reinvert
        x: float = (p1 - p2) / (m1 - m2) * (-1)
        
        y: float = config.MAP_SIZE_Y - (m1 * x + p1)
        
    else:

        if (identify(inverted_segment) == VERTICALLY):
            constant: float = get_constant(inverted_segment)
            m: float = get_derive(inverted_ball_segment)
            p: float = get_intercept(m, inverted_ball_segment.start)
        else:
            constant: float = get_constant(inverted_ball_segment)
            m: float = get_derive(inverted_segment)
            p: float = get_intercept(m, inverted_segment.start)
        
        x: float = constant
        y: float = config.MAP_SIZE_Y - (m * x + p)
    
    impact: Point = Point(x, y)
    
    return impact

def get_first_impact(segments: list[Segment], ball: Ball):
    
    cos: float = round(math.cos(ball.angle), 6)
    sin: float = round(math.sin(ball.angle), 6)
    
    inc_x: float = (-1) * get_sign(cos) * (config.STROKE_THICKNESS + config.BALL_SIZE / 2)
    inc_y: float = get_sign(sin) * (config.STROKE_THICKNESS + config.BALL_SIZE / 2)

    ball_segment: Segment = Segment(ball.position.location, Point(ball.position.location.x + cos, ball.position.location.y - sin))
    
    data: dict | None = None
    
    for segment in segments:
        
        segment_with_padding = segment.copy()
        
        segment_with_padding.start.x += inc_x
        segment_with_padding.stop.x += inc_x
        
        segment_with_padding.start.y += inc_y
        segment_with_padding.stop.y += inc_y
        
        impact: Point = get_impact_point(segment_with_padding, ball_segment)
        if (impact is None):
            continue

        # check if the impact point is in the right direction
        
        diff_x: float = ball.position.location.x - impact.x
        if (get_sign(diff_x) == get_sign(cos) and cos != 0):
            continue
        
        diff_y: float = (ball.position.location.y - impact.y)
        if (get_sign(diff_y) != get_sign(sin) and sin != 0):
            continue
        
        distance: float = ball.position.location.distance(impact)
        
        if data is None or distance < data.get("distance"):
            
            data = {
                "distance": distance,
                "impact": impact,
                "segment": segment,
                "inc_x": inc_x,
                "inc_y": inc_y,
            }
    
    return data

def get_player_hitted(game: PongGame, segment_hitted: Segment) -> PongPlayer | None:
    
    for player in game.get_valid_players():
        if player.rail is segment_hitted:
            return player
    return None

def paddle_collision(impact: Point, player: PongPlayer, inc_x: float, inc_y: float) -> Point | None:
    
    diff_x: float = player.rail.stop.x - player.rail.start.x
    diff_y: float = player.rail.stop.y - player.rail.start.y
    
    paddle_center_x: float = player.rail.start.x + diff_x * player.position.location
    paddle_center_y: float = player.rail.start.y + diff_y * player.position.location
    
    paddle_center: Point = Point(paddle_center_x, paddle_center_y)

    rail_length: float = player.rail.length()
    paddle_length: float =  rail_length * config.PADDLE_RATIO
    
    start_x: float = paddle_center.x - (diff_x * (paddle_length / 2 / rail_length))
    start_y: float = paddle_center.y - (diff_y * (paddle_length / 2 / rail_length))
    stop_x: float = paddle_center.x + (diff_x * (paddle_length / 2 / rail_length))
    stop_y: float = paddle_center.y + (diff_y * (paddle_length / 2 / rail_length))
    
    start: Point = Point(start_x, start_y)
    stop: Point = Point(stop_x, stop_y)    
    
    paddle: Segment = Segment(start, stop)
    
    hit_point: Point = Point(impact.x - inc_x, impact.y - inc_y)
    
    if not paddle.is_on(hit_point):
        return None
    
    paddle_angle: float = paddle.angle()
    
    normal: float = paddle_angle - math.pi / 2
    normal: float = math.atan2(math.sin(normal) * -1, math.cos(normal))
    
    start_distance: float = paddle.start.distance(impact)
    stop_distance: float = paddle.stop.distance(impact)
    
    hit_percent: float = (start_distance) / (start_distance + stop_distance)
    
    hit_percent = round(hit_percent, 1)
    
    new_angle: float = normal + (math.pi * 0.85) * (hit_percent - 0.5)

    return new_angle

def wall_collision(ball_angle: float, wall: Segment) -> float:
    
    wall_angle: float = wall.angle()
    
    cos: float = math.cos(wall_angle) * -1
    sin: float = math.sin(wall_angle)
    
    wall_angle: float = math.atan2(sin, cos)
    
    incident_angle: float = ball_angle - wall_angle

    reflection_angle: float = wall_angle - incident_angle
    
    return reflection_angle

def collision(game: PongGame, impact_data: dict) -> int | PongPlayer:
    
    segment: Segment = impact_data.get("segment")
    
    player_hitted: PongGame = get_player_hitted(game, segment)
    
    angle: float
    
    if player_hitted is None:
        angle = wall_collision(game.ball.angle, segment)
    else:
        angle = paddle_collision(impact_data.get("impact"), player_hitted, impact_data.get("inc_x"), impact_data.get("inc_y"))

        if angle is None:
            return player_hitted

    return angle

async def update_ball(game: PongGame, impact_data: dict):
    
    distance: float = impact_data.get("distance")

    time_before_impact: float = distance / game.ball.speed
    
    await asyncio.sleep(time_before_impact)

    ret: int | PongPlayer = collision(game, impact_data)
    
    if isinstance(ret, PongPlayer):
        await asyncio.sleep(0.1) # create frontend animation
        await SyncToAsync(game.goal)(ret)
    else:
        game.ball.speed = min(game.ball.speed + config.BALL_SPEED_INC, config.BALL_SPEED_MAX)
        game.ball.position.location = impact_data.get("impact")
        #game.ball.position.time = time.time() * 1000
        game.ball.angle = ret
    
    await SyncToAsync(game.broadcast)("update_ball", game.ball.to_dict())
    

async def render_ball(game: PongGame):

    segments: list[Segment] = [player.rail for player in game.players] + game.walls
    
    while True:
        
        impact_data: dict = get_first_impact(segments, game.ball)
        
        await update_ball(game, impact_data)

async def async_routine(game: PongGame):
    
    ball_routine = asyncio.create_task(render_ball(game))
    
    while True:
        
        if game.stopped:
            
            ball_routine.cancel()
            return
        
        await asyncio.sleep(1)

def routine(game: PongGame):
    
    asyncio.run(async_routine(game))