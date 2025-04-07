import { PongPlayer } from "./PongPlayer.js";
import { Client } from "../../Client.js";
import { Segment } from "./Segment.js";
import { PongGame } from "./PongGame.js";
import { Position } from "./Position.js";

export class PongMyPlayer extends PongPlayer
{
    /**
     * @param {Client} client 
     * @param {PongGame} game 
     * @param {Segment} rail 
     * @param {[Number]} score
     * @param {Position} position 
     * @param {Boolean} isEliminated 
     */
    constructor(client, game, score, rail, position = new Position(0.5), isEliminated)
    {
        super(client, game, client.me.id, client.me.username, client.me.avatar, score, rail, position, true, isEliminated);
        /**
         * @type {Client}
         */
        this.client = client;
        
        /**
         * @type {PongGame}
         */
        this.game;

        this.upKeys = [];
        this.downKeys = [];

        if (rail.start.x != rail.stop.x)
        {
            if (rail.start.x < rail.stop.x)
            {
                this.upKeys.push("a");
                this.downKeys.push("d");
            }
            else
            {
                this.upKeys.push("d");
                this.downKeys.push("a");
            }
        }
        if (rail.start.y != rail.stop.y)
        {
            if (rail.start.y < rail.stop.y)
            {
                this.upKeys.push("w");
                this.downKeys.push("s");
            }
            else
            {
                this.upKeys.push("s");
                this.downKeys.push("w");
            }
        }
    }    

    /**
     * @param {[string]} keys_pressed 
     */
    updatePaddle(keys_pressed)
    {
        let new_location = this.position.location;

        keys_pressed.forEach(key => {
            if (this.downKeys.includes(key))
                new_location += this.game.config.PADDLE_SPEED_PER_SECOND_MAX * this.game.time.deltaTimeSecond();
            if (this.upKeys.includes(key))
                new_location -= this.game.config.PADDLE_SPEED_PER_SECOND_MAX * this.game.time.deltaTimeSecond();
        });

        new_location = Math.max(0 + this.game.config.PADDLE_RATIO / 2, new_location);
        new_location = Math.min(1 - this.game.config.PADDLE_RATIO / 2, new_location);

        if (this.position.location === new_location)
            return;

        this.position.location = new_location;

        this._sendPaddlePosition();
    }

    _sendPaddlePosition()
    {
        this.game.send({"detail": "update_my_paddle_pos", ...{"time": this.game.time._currentFrame, "position": this.position}});
    }

    /**
     * @param {Position} newPosition 
     */
    updatePos(newPosition)
    {
        let position_verified = newPosition;

        let time_diff = (this.time._current_frame - newPosition.time) / 1000;

        let sign = this.position.location - newPosition.location >= 0 ? 1 : -1;

        let distance = Math.abs(this.position.location - newPosition.location);

        let distance_max = time_diff * this.game.config.paddle_speed_per_second_max;

        if (distance > distance_max)
            position_verified.location = distance_max * sign;

        this.position = position_verified;
    }
}