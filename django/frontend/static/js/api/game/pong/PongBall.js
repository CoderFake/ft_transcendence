import { AExchangeable } from "../../AExchangable.js";
import { PongGame } from "./PongGame.js";
import { renderCube} from "../../../3D/cube.js"
import { Position } from "./Position.js";
import { Point } from "./Point.js";

export class PongBall extends AExchangeable
{
    /**
     * 
     * @param {PongGame} game 
     * @param {Position} position
     * @param {Number} angle
     * @param {Number} speed
     * @param {Number} size
     */
    constructor(game, size, position = new Position(new Point(game.config.CENTER_X, game.config.CENTER_Y), 0), angle, speed)
    {
        super();

        /**
         * @type {PongGame}
         */
        this.game = game;

        /**
         * @type {Position}
         */
        this.position = position;

        /**
         * @type {Number}
         */
        this.size = size;

        /**
         * @type {Number}
         */
        this.angle = angle;

        /**
         * @type {Number}
         */
        this.speed = speed;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx)
    {
		ctx.rect(this.position.location.x - this.size / 2, this.position.location.y - this.size / 2, this.size, this.size);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx)
    {
        let distance = this.speed * (this.game.time.deltaTime() / 1000);

        this.position.location.x = this.position.location.x + distance * Math.cos(this.angle);
        this.position.location.y = this.position.location.y - distance * Math.sin(this.angle);

        this.draw(ctx);
    }
}
