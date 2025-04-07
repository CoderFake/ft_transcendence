import { Point } from "./Point.js";
import { AExchangeable } from "../../AExchangable.js";
import { PongGame } from "./PongGame.js";
import { renderCube } from "../../../3D/cube.js";

class Segment extends AExchangeable
{
    /**
     * @param {Point} start
     * @param {Point} stop
     * @param {PongGame} game 
     */
    constructor(game, start = new Point(), stop = new Point())
    {
        super();
        
        /**
         * @type {Point}
         */
        this.start = start;

        /**
         * @type {Point}
         */
        this.stop = stop;

        /**
         * @type {PongGame}
         */
        this.game = game

    }

    angle()
    {
        let x = this.start.x - this.stop.x,
            y = this.start.y - this.stop.y;

        return Math.atan2(y, x);
    }

    len()
    {
        let x = this.start.x - this.stop.x,
            y = this.start.y - this.stop.y;

        return (x ** 2 + y ** 2) ** (1 / 2);
    }

    draw(ctx)
	{
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.stop.x, this.stop.y);
	}

    /**
     * @param {[String]} additionalFieldList
     */
    export(additionalFieldList)
    {
        super.export([...additionalFieldList, "start", "stop"]);
    }
}

export { Segment }
