import { Client } from "../Client.js";
import { Profile } from "../Profile.js";
import { AGame } from "./AGame.js";

export class APlayer extends Profile
{
    /**
     * 
     * @param {Client} client 
     * @param {AGame} game 
     * @param {Number} id 
     * @param {String} username 
     * @param {String} avatar  
     * @param {Boolean} isConnected 
     */
    constructor (client, game, id, username, avatar, isConnected)
    {
        super(client, username, id, avatar);

        /**
         * @type {AGame}
         */
        this.game = game

        /**
         * @type {Boolean}
         */
        this.isConnected = isConnected;

    }

    /**
	 * @param {[String]} additionalFieldList
	 */
	export(additionalFieldList = [])
    {
        super.export([...additionalFieldList, ...["isConnected"]])
    }
}