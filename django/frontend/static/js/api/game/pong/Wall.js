import { Point } from "./Point.js";
import { PongGame } from "./PongGame.js";
import { Segment } from "./Segment.js";
import { renderCube} from "../../../3D/cube.js"

export class Wall extends Segment
{

    /**
     * @param {PongGame} game
     * @param {Point} start 
     * @param {Point} stop 
     */
    constructor(game, start, stop)
    {
        super(game, start, stop)

        /**
         * @type {PongGame}
         */
        this.game = game
    }

	draw(ctx)
	{
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.stop.x, this.stop.y);
	}
}
