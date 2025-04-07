import { Client } from "./Client.js";
import { Profile } from "./Profile.js";

class MyProfile extends Profile
{

	/**
	 * @param {Client} client 
	 */
	constructor (client)
	{
		super(client, "../me");

		/**
		 * @type {[Profile]}
		*/
		this.blockedUsers = [];
		// /**
		//  * @type {[Profile]}
		// */
		// this.friendList = [];
		// /**
		//  * @type {[Profile]}
		// */
		// this.incomingFriendRequests = [];
		// /**
		//  * @type {[Profile]}
		// */
		// this.outgoingFriendRequests = [];
	}

	async init() {
		await super.init();
		await this.getBlockedUsers();
		// await this.getFriends();
		// await this.getIncomingFriendRequests()
		// await this.getOutgoingFriendRequests()
	}

	async getBlockedUsers() {
		const response = await this.client._get('/api/profiles/block');
		const data = await response.json();
		data.forEach(profileData => this.blockedUsers.push(new Profile(this.client, profileData.username, profileData.id, profileData.avatar)));
	}

	async getFriends() {
		const response = await this.client._get('/api/profiles/friends');
		const data = await response.json();
		data.forEach(profileData => this.friendList.push(new Profile(this.client, profileData.username, profileData.id, profileData.avatar)));
	}
	async getIncomingFriendRequests() {
		const response = await this.client._get('/api/profiles/incoming_friend_requests');
		const data = await response.json();
		data.forEach(profileData => this.incomingFriendRequests.push(
			new Profile(this.client, profileData.username, profileData.id, profileData.avatar)
		));
	}
	async getOutgoingFriendRequests() {
		const response = await this.client._get('/api/profiles/outgoing_friend_requests');
		const data = await response.json();
		data.forEach(profileData => this.outgoingFriendRequests.push(
			new Profile(this.client, profileData.username, profileData.id, profileData.avatar)
		));
	}

	/**
	 * @param {Profile} profile
	 * @returns {Boolean}
	 */
	_isFriend(profile) {
		for (const user of this.friendList) {
			if (user.id === profile.id)
				return true;
		}
		return false;
	}
	/**
	 * @param {Profile} profile
	 * @returns {Boolean}
	 */
	_isBlocked(profile) {
		for (const user of this.blockedUsers) {
			if (user.id === profile.id)
				return true;
		}
		return false;
	}
	/**
	 * @param {Profile} profile
	 * @returns {Boolean}
	 */
	_hasIncomingRequestFrom(profile) {
		for (const user of this.incomingFriendRequests) {
			if (user.id === profile.id)
				return true;
		}
		return false;
	}
	/**
	 * @param {Profile} profile
	 * @returns {Boolean}
	 */
	_hasOutgoingRequestTo(profile) {
		for (const user of this.outgoingFriendRequests) {
			if (user.id === profile.id)
				return true;
		}
		return false;
	}

	/**
	 * 
	 * @param {File} selectedFile
	 * @returns {Promise<Response>}
	 */
	async changeAvatar(selectedFile)
	{
		const formData = new FormData();
		formData.append('avatar', selectedFile);

		const response = await this.client._patch_file(`/api/profiles/settings`, formData);
		const responseData = await response.json();

		if (response.ok) {
			this.avatar = responseData.avatar;
			return null;
		}
		return responseData;
	}

	async deleteAvatar() {
		const response = await this.client._delete('/api/profiles/settings');
		const responseData = await response.json();

		if (response.ok) {
			this.avatar = responseData.avatar;
			return null;
		}
		return responseData;
	}

}

export {MyProfile};
