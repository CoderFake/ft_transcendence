import { AExchangeable } from "../../AExchangable.js";

export class PongConfig extends AExchangeable
{
	/**
	 * @param  {Client} client
	 */
	constructor(client)
	{
        super();

		/**
		 * @type {Client}
		 */
        this.client = client;

        /**
         * @type {Number}
         */
        this.MAP_SIZE_X;

        /**
         * @type {Number}
         */
        this.MAP_SIZE_Y;

        /**
         * @type {Number}
         */
        this.WALL_RATIO;

        /**
         * @type {Number}
         */
        this.PADDLE_SPEED_PER_SECOND_MAX;

        /**
         * @type {Number}
         */
        this.PADDLE_RATIO;

        /**
         * @type {Number}
         */
        this.BALL_SIZE;

        /**
         * @type {Number}
         */
        this.BALL_SPEED_INC;

        /**
         * @type {Number}
         */
        this.BALL_SPEED_START;

        /**
         * @type {Number}
         */
        this.STROKE_THICKNESS;

        /**
         * @type {Number}
         */
        this.GAME_MAX_SCORE;

        /**
         * @type {Number}
         */
        this.MAP_CENTER_X;

        /**
         * @type {Number}
         */
        this.MAP_CENTER_Y;
    }

    async init()
    {
        let response = await this.client._get("/api/games/");

		if (response.status !== 200)
            return response.status;

        let response_data = await response.json();

        this.import(response_data);

        this.MAP_CENTER_X = this.MAP_SIZE_X / 2;
        this.MAP_CENTER_Y = this.MAP_SIZE_Y / 2;

        return 0;
    }
}