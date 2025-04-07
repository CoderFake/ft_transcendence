import { Client } from "./Client.js";

class MatchMaking
{
	/**
	 * @param  {Client} client
	 */
	constructor(client)
	{
		/**
		 * @type {Client}
		 */
		this.client = client;
		this.searching = false;
	}

	/**
	 * 
	 * @param {CallableFunction} receive_func 
	 * @param {CallableFunction} disconnect_func 
	 * @param {Number} mode The number of players in a game 
	 * @returns {Promise<?>}
	 */
	async start(receive_func, disconnect_func, game_type, mode)
	{
		if (!await this.client.isAuthenticated())
			return null;
		
		let url = `${window.location.protocol[4] === 's' ? 'wss' : 'ws'}://${window.location.host}/ws/matchmaking/${game_type}/${mode}`;

		this._socket = new WebSocket(url);
		
		this.searching = true;

		this.receive_func = receive_func;
		this.disconnect_func = disconnect_func;

		this._socket.onmessage = function (event) {
			const data = JSON.parse(event.data);
			receive_func(data);
		};

		this._socket.onclose = this.onclose.bind(this);
	}

	onclose(event)
	{
		this.stop();
		this.disconnect_func(event);
	}

	stop()
	{
		if (this._socket)
			this._socket.close();
		this._socket = undefined;
		this.searching = false;
	}
}

export {MatchMaking};
