import {Client} from './Client.js';
import {createNotification} from '../utils/noticeUtils.js'
import { lastView, navigateTo } from '../index.js';
import ProfilePageView from '../views/ProfilePageView.js';
import Search from '../views/Search.js';
import { sleep } from '../utils/sleep.js';

export default class Notice {

	/**
	 * @param  {Client} client
	 */
	constructor(client) {
		/**
		 * @type {Client}
		 */
		this.client = client;
		this.url = location.origin.replace('http', 'ws') + '/ws/notice';
	}

	async start() {
		this._socket = new WebSocket(this.url);

		this._socket.onclose = _ => this._socket = undefined;
		this._socket.onmessage = async message => {
			const data = JSON.parse(message.data);

			if (data.type === 'friend_request') {
				this.friend_request(data.author);
			} else if (data.type === 'new_friend') {
				this.new_friend(data.friend);
			} else if (data.type === 'friend_removed') {
				this.friend_removed(data.friend);
			} else if (data.type === 'friend_request_canceled') {
				this.friend_request_canceled(data.author);
			} else if (data.type === 'online') {
				this.online(data.user)
			} else if (data.type === 'offline') {
				this.offline(data.user)
			} else if (data.type == 'game_asked') {
                this.game_asked(data.asker);                
			} else if (data.type == 'game_accepted') {
                this.game_accepted(data.asked, data.id_game);
			} else if (data.type == 'game_refused') {
                this.game_refused(data.asked);
            }
		};
	}

	async stop() {
		if (this._socket) {
			while (!this._socket.readyState === 1)
				await sleep(100);
			this._socket.close()
			this._socket = undefined;
		}
	}

	_setOnlineStatus(user, status) {
		if (lastView instanceof ProfilePageView && lastView.profile.id === user.id) {
			lastView.profile.online = status;
			lastView.loadFriendshipStatus();
		}
		else if (lastView instanceof Search) {
			lastView.display_specific_user(user.id);
		}
	}

	online(user) {
		this._setOnlineStatus(user, true)
	}

	offline(user) {
		this._setOnlineStatus(user, false)
	}

	friend_request(author) {
		createNotification('Friend Request', `<strong>${author.username}</strong> sent you a friend request.`);
		if (lastView instanceof ProfilePageView && lastView.profile.id === author.id) {
			lastView.profile.hasIncomingRequest = true;
			lastView.loadFriendshipStatus();
		}
	}

	new_friend(friend) {
		createNotification('New Friend', `<strong>${friend.username}</strong> accepted your friend request.`);
		if (lastView instanceof ProfilePageView && lastView.profile.id === friend.id) {
			lastView.profile.isFriend = true;
			lastView.profile.hasIncomingRequest = false;
			lastView.profile.hasOutgoingRequest = false;
			lastView.loadFriendshipStatus();
		}
	}

	friend_removed(exFriend) {
		if (lastView instanceof ProfilePageView && lastView.profile.id === exFriend.id) {
			lastView.profile.isFriend = false;
			lastView.profile.online = null;
			lastView.loadFriendshipStatus();
		}
	}

	friend_request_canceled(author) {
		if (lastView instanceof ProfilePageView && lastView.profile.id === author.id) {
			lastView.profile.hasIncomingRequest = false;
			lastView.loadFriendshipStatus();
		}
	}

    game_asked(asker) {
        createNotification('Game Invite', `<b>${asker}</b> ask to play a 1vs1 pong`);
        if (lastView instanceof Search)
           lastView.display_invite(); 
    }

    game_refused(asked) {
        createNotification('Game Refused', `<b>${asked}</b> refuse your proposition to play`);
        if (lastView instanceof Search)
           lastView.display_invite(); 
    }

    async game_accepted(asked, id_game) {
        createNotification('Game Accepted', `<b>${asked}</b> accept your proposition to play`);
        if (lastView instanceof Search)
           lastView.display_invite(); 

        await navigateTo(`/games/pong/${id_game}`);
    }
}
