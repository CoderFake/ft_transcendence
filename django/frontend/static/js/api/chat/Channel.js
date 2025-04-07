import {Message} from "./Message.js";

class Channel {
	constructor(client, channel, members, messages, reload) {
		this.client = client;
		this.channel = channel;
		this.members = members;
		this.messages = [];
		if (messages != undefined)
			this.updateMessages(messages);

		this.connect(reload);
	}

	// reload = function to use when we receive a message
	connect(reload) {
		const url = location.origin.replace('http', 'ws') +
			'/ws/chat/' +
			this.channel;

		this.chatSocket = new WebSocket(url);
		this.chatSocket.onmessage = (event) =>{
			let data = JSON.parse(event.data);

			this.messages.push(new Message(
				this.channel,
				data.author_id,
				data.content,
				data.time,
			));

			reload();
		};
	}

	disconnect() {
		this.chatSocket.close();
	}

	updateMessages(messages)
	{
		this.messages = [];

		messages.forEach((message) => {
			this.messages.push(new Message(
				message.channel,
				message.author,
				message.content,
				message.time,
			));
		});
	}

	async sendMessageChannel(message, receivers_id) {

		if (this.chatSocket == undefined)
			return;

		this.chatSocket.send(JSON.stringify({
			'message':message,
			'receivers_id':receivers_id,
		}));
	}
}

export {Channel};
