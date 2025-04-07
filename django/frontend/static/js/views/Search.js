import AbstractView from "./abstracts/AbstractView.js";
import { client, lang } from "../index.js";
import Channels from '../api/chat/Channels.js'
import Ask from '../api/chat/Ask.js'

export default class extends AbstractView {
	constructor(params) {
		super(params, 'SearchWindowTitle');
		this.channelManager = new Channels(client);
        this.AskGame = new Ask(client);
	}

	async postInit() {
		this.profiles = await client.profiles.all();
		this.logged = await client.isAuthenticated();

		document.getElementById("username-input").oninput = () => this.display_users();

		this.last_add_chat = undefined;

		this.display_users();
		this.display_chat();
	}

	async display_users() {

		const search = document.getElementById("username-input").value.toLowerCase();
		
		let list_users = document.getElementById('user-list');
		list_users.innerHTML = "";

		this.profiles.filter(user => user.username.toLowerCase().startsWith(search) == true).forEach(async (user) => {

			const new_user = document.createElement("li");

			// username
			const username = document.createElement("a");
			username.setAttribute('data-link', '');
			username.id = `username${user.id}`;
			username.href = `/profiles/${user.username}`;
			if (this.logged && user.id == client.me.id)
				username.style.color = "green";
			else {
			    let online = (await client.profiles.getProfile(user.username)).online;
				if (online == undefined)
					username.style.color = "gray";
				else if (online == true)
					username.style.color = "green";
				else
					username.style.color = "red";
			}
			username.appendChild(document.createTextNode(user.username));
			new_user.appendChild(username);

			// space
			new_user.appendChild(document.createTextNode(" "));

			// button chat
			if (this.logged && client.me.id != user.id) {
				let add_chat = document.createElement("a");
				add_chat.id = "add_chat_off";
				add_chat.onclick = async () => {
					if (this.channelManager.channel != undefined) {

						// Permet de savoir si c'est le même channel
						// Check to know if it's the same channel
						this.channelManager.channel.members.forEach((member_id) => {
							if (member_id == user.id)
								this.channelManager.channel = undefined;
						});
						if (this.channelManager.channel == undefined) {
							add_chat.id = "add_chat_off";
							this.last_add_chat = undefined;
							return await this.hide_chat();
						}

						await this.channelManager.channel.disconnect();
					}
					await this.channelManager.createChannel([client.me.id , user.id], () => this.reload_display_messages());
					this.display_chat();
					if (this.last_add_chat != undefined)
						this.last_add_chat.id = "add_chat_off";
					this.last_add_chat = add_chat;
					add_chat.id = "add_chat_on";
				};
				add_chat.appendChild(document.createTextNode("Chat"));
				new_user.appendChild(add_chat);
				
				new_user.appendChild(document.createTextNode(" "));

			}
			
			// break line
			new_user.appendChild(document.createElement("br"));

			// avatar
			var img = document.createElement("img");
			img.src = user.avatar;
			new_user.appendChild(img);


			list_users.appendChild(new_user);
		});

	}

	async display_specific_user(id) {

		let user = document.getElementById("username" + id);
		if (user == undefined)
			return ;

		if (this.logged && id == client.me.id)
			user.style.color = "green";
		else {
			let profile = await client.profiles.getProfileId(id);
			let online = profile.online;
			if (online == undefined)
				user.style.color = "gray";
			else if (online == true)
				user.style.color = "green";
			else
				user.style.color = "red";
		}
	}

	async display_chat()
	{
		let reloads = ["members", "messages"];
		reloads.forEach(reload => {
			if (document.getElementById(reload) != undefined)
				document.getElementById(reload).remove();
		});

		if (this.channelManager.channel === undefined || this.logged === false)
			return ;

		let chats = document.getElementById("chats");

		if (document.getElementById("chat") == null) {
			let chat = document.createElement("div");
			chat.id = "chat";
			chats.appendChild(chat);
		}

		// nom des membres du channel
		let members = await this.display_members(chat);

		// L'affiche des messages
		let messages = await this.display_messages(chat);

		// Input pour rentrer un message
		let chat_input = document.getElementById("chat_input") || document.createElement("input");
		chat_input.id="chat_input";
		chat_input.type="text";
		chat_input.name="message";
		chat_input.placeholder="message Pong";
		chat_input.maxLength=255;
		chat.appendChild(chat_input);
		
		let members_id = this.channelManager.channel.members;

		chat_input.onkeydown = async () => {
			if (event.keyCode == 13 && this.channelManager.channel != undefined) {
				//let chat_input = document.getElementById("chat-input");
				let chat_text = chat_input.value;

					let receivers_id = [];
					members_id.forEach((member_id) => {
						if (member_id != client.me.id)
							receivers_id.push(this.profiles.filter(user => user.id == member_id)[0].id);
					});
					await this.channelManager.channel.sendMessageChannel(chat_text, receivers_id);
				// Reset
				chat_input.value = "";
			}
		};
		chat_input.focus();


		// Scroll to the bottom of messages
		messages.scrollTop = messages.scrollHeight;

		await this.display_invite();
	}

	async display_messages(chat) {

		let messages = document.createElement("div");

		messages.id = "messages";
		chat.appendChild(messages);

		// les messages, réecriture seulement du dernier 
		this.channelManager.channel.messages.forEach((message) => {
			let text = document.createElement("p");
			let date = new Date(message.time);
			text.title = date.toLocaleString("fr-FR");
			text.appendChild(document.createTextNode(message.content));
			text.id = message.author === client.me.id ?  "you" : "other";

			messages.appendChild(text);
		});

		return messages;
	}

	async reload_display_messages() {
		let messages = document.getElementById("messages");

        let i = 0;
		this.channelManager.channel.messages.forEach((message) => {
            let content, child_inner;
            if (messages.children[i] != null) {
                child_inner = messages.children[i].innerText.toLowerCase().replace(/\s/g, '');
                content = message.content.toLowerCase().replace(/\s/g, '');
            }

			if (messages.children[i] == null || content != child_inner) {
                let text = document.createElement("p");
                let date = new Date(message.time);
                text.title = date.toLocaleString("fr-FR");
                text.appendChild(document.createTextNode(message.content));
                text.id = message.author === client.me.id ?  "you" : "other";

                messages.appendChild(text);
			}
			i++;
		});

		messages.scrollTop = messages.scrollHeight;
	}

	async display_members(chat) {

		let members_id = this.channelManager.channel.members;

		let members = document.createElement("h2");
		members.id = "members";
		let usernames = "";
		members_id.forEach((member_id) => {
			if (member_id != client.me.id) {
				if (usernames.length > 0)
					usernames += ", ";
				usernames += (this.profiles.filter(user => user.id == member_id)[0].username);
			}
		});
		members.textContent = usernames;
		chat.appendChild(members);


		return members;
	}

	async display_invite() {

		let chat = document.getElementById("chat");

		if (chat == undefined)
			return ;

		let members_id = this.channelManager.channel.members;
		let others = members_id.filter(id => id !== client.me.id);
        let user = others[0];

		let invite = document.getElementById("invite") || document.createElement("button");
		let yes = document.getElementById("yes") || document.createElement("button");
		let no = document.getElementById("no") || document.createElement("button");

		const is_asked = await this.AskGame.is_asked(user);

		if (!is_asked) {

			if (yes && no) {
				yes.remove();
				no.remove();
			}

			// Button to send invite to play
			invite.id = "invite";
			invite.style.background = "orange";
			invite.innerText = "invite";
			invite.title = "Invite to play a game";
			invite.onclick = async () => {
                await this.AskGame.ask_game(user)
			};
			chat.appendChild(invite);
		}
		else {

			if (invite)
				invite.remove();

			yes.id = "yes";
			yes.style.background = "green";
			yes.title = "Accept to play a game";
			yes.onclick = async () => {
                await this.AskGame.ask_game_accepted(user)
			};

			no.id = "no";
			no.style.background = "red";
			no.title = "Refuse to play a game";
			no.onclick = async () => {
                await this.AskGame.ask_game_refused(user)
			};

			chat.appendChild(yes);
			chat.appendChild(no);
		}

	}

	async hide_chat() {

		let closes = ["chat", "invite"];
		closes.forEach(close => {
			if (document.getElementById(close))
				document.getElementById(close).remove();
				
		});
	}

	async leavePage() {
		if (this.channelManager.channel != undefined)
			this.channelManager.channel.disconnect();
		this.channelManager.channel = undefined;

	}

    async getHtml() {
        return `
			<link rel="stylesheet" href="/static/css/search.css">

			<div id="chats">
				<div id="users">
					<input id="username-input" type="text" name="message" placeholder="userPong"/>
					<ul id='user-list'>
					</ul>
				</div>
			</div>
        `;
    }
}
