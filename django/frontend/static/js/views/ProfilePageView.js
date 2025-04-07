import AbstractView from "./abstracts/AbstractView.js";
import { client, lang } from "../index.js";

export default class extends AbstractView {
	constructor(params) {
		super(params, `${decodeURI(params.username)} - Profile`);
		this.username = decodeURI(params.username);
	}

	setTitle() {
		document.title = this.titleKey;
	}

	async postInit()
	{
		if (!this.profile)
			return 404;

		const games = await this.profile.getGameHistory();

		await this.fillHistory(games);
		await this.fillStatistics(games);

		if (!client.me || this.profile.id === client.me.id)
			return;

		const addFriendButton = document.getElementById('addFriendButton'),
			  removeFriendButton = document.getElementById('removeFriendButton'),
			  blockButton = document.getElementById('blockButton'),
			  unblockButton = document.getElementById('unblockButton');

		this.loadFriendshipStatus();
		if (this.profile.isBlocked)
			unblockButton.classList.remove('d-none');
		else
			blockButton.classList.remove('d-none');

		addFriendButton.onclick = _ => this.addFriend();
		removeFriendButton.onclick = _ => this.removeFriend();
		unblockButton.onclick = _ => this.unblockUser();
		blockButton.onclick = _ => this.blockUser();
	}

	loadFriendshipStatus() {
		const addFriendButton = document.getElementById('addFriendButton'),
			  removeFriendButton = document.getElementById('removeFriendButton'),
			  statusIndicator = document.getElementById('statusIndicator');

		if (this.profile.hasIncomingRequest) {
			removeFriendButton.classList.add('d-none');
			addFriendButton.classList.remove('d-none');
			addFriendButton.innerHTML = 'Accept Request';
		} else if (this.profile.hasOutgoingRequest) {
			addFriendButton.classList.add('d-none');
			removeFriendButton.classList.remove('d-none');
			removeFriendButton.classList.replace('btn-danger', 'btn-secondary');
			removeFriendButton.innerHTML = 'Cancel Request';
		} else if (this.profile.isFriend) {
			addFriendButton.classList.add('d-none');
			removeFriendButton.classList.remove('d-none');
			removeFriendButton.classList.replace('btn-secondary', 'btn-danger');
			removeFriendButton.innerHTML = 'Remove Friend';
		} else {
			addFriendButton.innerHTML = 'Add Friend';
			removeFriendButton.classList.add('d-none');
			addFriendButton.classList.remove('d-none');
		}

		statusIndicator.classList.remove('bg-success', 'bg-danger');
		if (this.profile.online === true)
			statusIndicator.classList.add('bg-success');
		else if (this.profile.online === false)
			statusIndicator.classList.add('bg-danger');
	}

	/**
	 * @param {[Object]} games 
	 */
	async fillStatistics(games)
	{
		const winrateDiv = document.getElementById("winrate");

		let win = 0;
		let lose = 0;

		games.forEach(game => {
			if (game.finished === false)
				return
			if (this.profile.id === game.winner?.id)
				win++;
			else
				lose++;
		});

		if (games.length) {
			let rate = win / (win + lose) * 100;
			winrateDiv.innerText = `Winrate: ${rate.toFixed()}%`;
		} else {
			winrateDiv.innerText = `Winrate: 🤓`
		}
	}

	async fillHistory(games)
    {
        let game_list = document.getElementById("game-list");

        games.forEach(game => {

            let a = document.createElement("a");
            a.href = `/games/${game.game_type}/${game.id}`;
            a.setAttribute("data-link", true);

            let game_item = document.createElement("div");
            game_item.className = "game-item";
            game_item.style.backgroundColor = "grey";
			if (game.finished && game.winner == null)
				game_item.style.backgroundColor = "red";
			else if (game.finished)
                game_item.style.backgroundColor = this.profile.id === game.winner.id ? "green" : "red";
            else if (game.started)
                game_item.style.backgroundColor = "yellow";

			let gametype = document.createElement("b");
			gametype.innerText = "Pong";
			game_item.appendChild(gametype);

            game.players.forEach(player => {
                let player_score = document.createElement("a");

                player_score.href = `/profiles/${player.username}`;
                player_score.innerText = `${player.username}`;
                player_score.setAttribute("data-link", true);

                game_item.appendChild(player_score);
            });
            a.appendChild(game_item);
            game_list.appendChild(a);
        });
    }

	async getHtml() {

		this.profile = await client.profiles.getProfile(this.username);
		if (!this.profile)
			return '';

		return /* HTML */ `
		<div>
		  <div class='mb-3' id='profileInfo'>
			<h1>${this.username}<span id='statusIndicator' style='height:0.75em; width:0.75em' class='ms-2 rounded-circle border d-inline-block'></span></h1>
			<a href=${this.profile.avatar} target='_blank'>
			<img class='img-thumbnail' src=${this.profile.avatar} style='width:auto; max-height:20vh; min-height:10vh'>
			</a>
		  </div>
		  <div>
			<button class='btn btn-sm btn-success d-none' id='addFriendButton'>Add Friend</button>
			<button class='btn btn-sm btn-danger d-none' id='removeFriendButton'>Remove Friend</button>
			<button class='btn btn-sm btn-danger d-none' id='blockButton'>Block</button>
			<button class='btn btn-sm btn-secondary d-none' id='unblockButton'>Unblock</button>
		  </div>
		  <h1>Games</h1>
		  <div>
			<h1 id='winrate'></h1>
		  </div>
		  <div>
			<link rel="stylesheet" href="/static/css/gameHistory.css">
			<div id="game-list"></div>
		  </div>
		</div>
		`;
	}

	async addFriend() {
		const removeFriendButton = document.getElementById('removeFriendButton');

		const response = await client._post(`/api/profiles/friends/${this.profile.id}`);

		if (response.ok) {
			removeFriendButton.classList.remove('d-none');
			document.getElementById('addFriendButton').classList.add('d-none');
		}
		if (response.status === 200) {
			removeFriendButton.innerHTML = 'Cancel Request';
			removeFriendButton.classList.replace('btn-danger', 'btn-secondary');
			this.profile.hasOutgoingRequest = true;
		} else if (response.status === 201) {
			removeFriendButton.innerHTML = 'Remove Friend';
			removeFriendButton.classList.replace('btn-secondary', 'btn-danger');
			this.profile.isFriend = true;
			this.profile.hasIncomingRequest = false;
		}
	}

	async removeFriend() {
		const addFriendButton = document.getElementById('addFriendButton'),
			  statusIndicator = document.getElementById('statusIndicator');

		const response = await client._delete(`/api/profiles/friends/${this.profile.id}`);

		if (response.ok) {
			addFriendButton.innerHTML = 'Add Friend';
			addFriendButton.classList.remove('d-none');
			statusIndicator.classList.remove('bg-danger', 'bg-success');
			document.getElementById('removeFriendButton').classList.add('d-none');
		}
		if (response.status === 200) {
			this.profile.hasOutgoingRequest = false;
		} else if (response.status === 201) {
			this.profile.isFriend = false;
			this.profile.online = null;
		}
	}

	async blockUser() {
		const response = await client._post(`/api/profiles/block/${this.profile.id}`);

		if (response.ok) {
			document.getElementById('blockButton').classList.add('d-none');
			document.getElementById('unblockButton').classList.remove('d-none');
			client.me.blockedUsers.push(this.profile);
			this.profile.isBlocked = true;
		}
	}

	async unblockUser() {
		const response = await client._delete(`/api/profiles/block/${this.profile.id}`);

		if (response.ok) {
			document.getElementById('unblockButton').classList.add('d-none');
			document.getElementById('blockButton').classList.remove('d-none');
			client.me.blockedUsers = client.me.blockedUsers.filter(profile => profile.id !== this.profile.id);
			this.profile.isBlocked = false;
		}
	}
}
