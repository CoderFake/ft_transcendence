import { APlayer } from "../APlayer.js";
import { Point } from "./Point.js";
import { Segment } from "./Segment.js";
import { Client } from "../../Client.js";
import { PongGame } from "./PongGame.js";
import { Position } from "./Position.js";

export class PongPlayer extends APlayer
{
    /**
     * @param {Number} id 
     * @param {PongGame} game 
     * @param {Segment} rail
     * @param {[Number]} score 
     * @param {Position} position 
     * @param {Boolean} isConnected
     * @param {String} username
     * @param {String} avatar 
     * @param {Client} client 
     * @param {Boolean} isEliminated 
     */
    constructor(client, game, id, username, avatar, score = [], rail = new Segment(game), position = new Position(0.5), isConnected, isEliminated)
    {
        super(client, game, id, username, avatar, isConnected)

        /**
         * @type {Position}
         */
        this.position = position;

        /**
          * @type {[Number]}
          */
        this.score = score;
 
        /**
         * @type {Segment}
         */
        this.rail = rail;

        /**
         * @type {PongPlayer}
         */
        this.game = game;

        /**
         * @type {Boolean}
         */
        this.isEliminated = isEliminated;
    }

    /**
     * 
     * @param {Number} new_position 
     */
    updatePos(new_position)
    {
        this.position = new_position;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */  
    draw(ctx)
    {
        if (this.isConnected === false || this.isEliminated === true)
        {
            this.rail.draw(ctx)
            return;
        }

        const diffX = this.rail.stop.x - this.rail.start.x,
              diffY = this.rail.stop.y - this.rail.start.y;

        const railLength = this.rail.len(),
              paddleLength = railLength * this.game.config.PADDLE_RATIO;

        const paddleCenter = new Point(this.rail.start.x + diffX * this.position.location,
                                      this.rail.start.y + diffY * this.position.location);

        const paddleStartX = paddleCenter.x - (diffX * (paddleLength / 2 / railLength)),
              paddleStartY = paddleCenter.y - (diffY * (paddleLength / 2 / railLength)),
              paddleStopX = paddleCenter.x + (diffX * (paddleLength / 2 / railLength)),
              paddleStopY = paddleCenter.y + (diffY * (paddleLength / 2 / railLength));

        let paddleStart = new Point(paddleStartX, paddleStartY),
            paddleStop = new Point (paddleStopX, paddleStopY);

        let paddle = new Segment(this.game, paddleStart, paddleStop);

        paddle.draw(ctx);
    }

    /**
     * @param {[String]} additionalFieldList 
     */
    export(additionalFieldList = [])
    {
        super.export([...additionalFieldList, "position", "rail", "score"])
    }
}