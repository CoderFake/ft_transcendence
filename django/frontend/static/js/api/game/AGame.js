import { AExchangeable } from "../AExchangable.js";
import { APlayer } from "./APlayer.js";
import { Client } from "../Client.js"
import { sleep } from "../../utils/sleep.js";
import { Profile } from "../Profile.js";

export class AGame extends AExchangeable
{
    /**
     * Abstract class to create commununication between client and server
     * @param {Client} client 
     * @param {Number} id 
     * @param {CallableFunction} receiveHandler 
     * @param {CallableFunction} disconntectHandler 
     * @param {"pong"} gameType
     */
    constructor(client, id, receiveHandler, disconntectHandler, gameType)
    {
        super();

        /**
         * @type {Client}
         */
        this.client = client;

        /**
         * @type {Number}
         */
        this.id = id;

        /**
         * ex: Tictactoe, Pong
         * @type {String}
         */
        this.gameType = gameType;

        /**
         * @type {CallableFunction}
         */
        this._receiveHandler = receiveHandler;

        /**
         * @type {CallableFunction}
         */
        this._disconntectHandler = disconntectHandler;

        /**
         * @type {Profile}
         */
        this.winner;
        
        /**
         * @type {Number}
         */
        this.startTimestamp;

        /**
         * @type {Number}
         */
        this.stopTimestamp;

        /**
         * @type {Boolean}
         */
        this.started;

        /**
         * @type {Boolean}
         */
        this.finished;

        /**
         * @type {[APlayer]}
         */
        this.players = [];
    }

    async init()
    {
        let response = await this.client._get(`/api/games/${this.id}`);

        if (response.status !== 200)
            return response.status;
        
        let response_data = await response.json();

        this.import(response_data);
    }

    getState()
    {
        return ["waiting", "started", "finished"][this.started + this.finished];
    }

    /**
     * Send string to the server, must be excuted after .join()
     * @param {String} data 
     */
    send(data)
    {
        if (this._socket === undefined || this._socket.readyState !== WebSocket.OPEN)
            return;
        this._socket.send(data);
    }

    async join()
    {
        if (this.finished === true)
        {
            console.error("The Game is not currently ongoing.");
            return;
        }

        const url = `${window.location.protocol[4] === 's' ? 'wss' : 'ws'}://${window.location.host}/ws/games/${this.gameType}/${this.id}`;

        this._socket = new WebSocket(url);

        this._socket.onmessage = async (event) => {
			const data = JSON.parse(event.data);
			await this._receiveHandler(data);
		};

        this._socket.onclose = async () => {
            this._socket = undefined;
            await this._disconntectHandler();            
        }; 
    }

    leave()
    {
        if (this._socket)
        {
            this._socket.close();
            this._socket = undefined;
        }
    }

    /**
     * Should be redefine using your own APlayer inherited
     * @param {Object} data 

    import(data)
    {
        super.import(data);

        // just an example code

        /*
        this.players.length = 0;

        data.players.forEach(player_data => {
            let player = new APlayer(this.client, this);
            player.import(player_data);
            this.players.push(player);
        });
        
    }
    */
}