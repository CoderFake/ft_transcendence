import { Time } from "./Time.js";
import { AGame } from "../AGame.js";
import { PongConfig } from "./PongConfig.js";
import { PongPlayer } from "./PongPlayer.js";
import { Client } from "../../Client.js";
import { PongBall } from "./PongBall.js";
import { sleep } from "../../../utils/sleep.js";
import { Wall } from "./Wall.js"
import { Position } from "./Position.js";

export class PongGame extends AGame
{
	/**
	 * @param {Client} client
     * @param {CallableFunction} goal_handler
     * @param {CallableFunction} finish_handler 
     * @param {CallableFunction} disconnect_handler
     * @param {CallableFunction} startHandler 
     * @param {Number} id 
	 */
	constructor(client, id, disconnectHandler, goalHandler, startHandler, finishHandler)
	{
        super(client, id,  undefined, disconnectHandler, "pong");

        this._receiveHandler = this._receive;

        /**
         * @type {CallableFunction}
         */
        this._goalHandler = goalHandler;

        /**
         * @type {CallableFunction}
         */
        this._startHandler = startHandler;
        
        /**
         * @type {CallableFunction}
         */
        this._finishHandler = finishHandler

        /**
         * @type {Time}
         */
        this.time;

        /**
         * @type {Boolean}
         */
        this._inited = false;

        /**
         * @type {PongConfig}
         */
        this.config;

        /**
         * @type {Ball}
         */
        this.ball = new PongBall(this, undefined, new Position(), 0, 0);

        /**
         * @type {[Wall]}
         */
        this.walls = [];

        /**
         * @type {[PongPlayer]}
         */
        this.players = [];
    }

    /**
     * 
     * @returns {Promise<Number>}
     */
    async init()
    {
        let response = await this.client._get(`/api/games/${this.id}`);

        if (response.status !== 200)
            return response.status;
        
        let response_data = await response.json();

        response_data.players.forEach((player_data) => {
            let player = new PongPlayer(this.client, this)
            this.players.push(player);
        });

        this.import(response_data);

        if (this.finished === true)
            return 0;

        this.config = new PongConfig(this.client);

        let ret = await this.config.init();

        if (ret !== 0)
            return ret;

        this.time = new Time();

        return 0;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawSides(ctx)
    {
        this.walls.forEach(wall => {
            wall.draw(ctx);
        });

        this.players.forEach(player => {
            player.draw(ctx);
        });
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx)
    {
		ctx.clearRect(0, 0, this.config.MAP_SIZE_Y, this.config.MAP_SIZE_Y);

        this.drawSides(ctx);
        this.ball.render(ctx);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = this.config.STROKE_THICKNESS;
        ctx.stroke();
    }

    /**
     * @param {Object} data 
     */
    send(data)
    {
        super.send(JSON.stringify(data));
    }

    /**
     * @param {Object} data 
     */
    async _receive(data)
    {
        if (this._inited === false  && data.detail === "init_game")
        {
            this._initGame(data);
            return;
        }

        if (data.detail === "update_player")
            this._updatePlayer(data);
        else if (data.detail === "update_ball")
            this._updateBall(data);
        else if (data.detail === "goal")
            await this._receiveGoal(data);
        else if (data.detail === "finish")
            await this._receiveFinish(data);
        else if (data.detail === "start")
            await this._receiveStart();
        else if (data.detail === "eliminated")
            await this._receiveEliminated(data)
    }

    async _receiveEliminated(data)
    {
        let eliminated = this.players.find(player => player.id === data.eliminated_id)
        eliminated.isEliminated = true;
    }

    async _receiveFinish(data)
    {
        const winner = this.players.find(player => player.id === data.winner_id)
        this.finished = true;
        await this._finishHandler(winner);
    }


    async _receiveStart()
    {
        this.started = true;
        await this._startHandler();
    }

    async _receiveGoal(data)
    {
        const player = this.players.find((player) => player.id === data.player_id);

        if (player === undefined)
        {
            console.error("error: unknown player.")
            return
        }

        player.score.push(data.timestamp)
        
        await this._goalHandler(player);
    }

    _updatePlayer(data)
    {
        let player = this.players.find((player) => player.id === data.id);

        player.import(data);
    }

    _updateBall(data)
    {
        this.ball.import(data);
    }

    _initGame(data)
    {
        data.walls.forEach((wall_data) => {
            this.walls.push(new Wall(this));
        });

        this.import(data);

        this._inited = true;
    }

    async waitInit()
    {
        while (this._inited !== true)
            await sleep(100);
    }
}