import {Channel} from "./Channel.js";

export default class Channels {
	constructor(client) {
		this.client = client;
		this.channel = undefined;
	}

	async createChannel(members_id, reload) {
		
		const response = await this.client._post("/api/chat/", {
			members_id:members_id
		});

		if (response.status >= 300)
			return undefined;

		const data = await response.json();

		this.channel = new Channel(this.client, data.id, members_id, data.messages, reload);
	}
}
