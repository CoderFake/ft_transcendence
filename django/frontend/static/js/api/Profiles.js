import { Profile } from "./Profile.js";

class Profiles
{
	/**
	 * @param  {Client} client
	 */
	constructor (client)
	{
		/**
		 * @type {Client} client
		 */
		this.client = client;
	}

	/**
	 * 
	 * @returns {Promise<[Profile]>}
	 */
	async all()
	{
		let response = await this.client._get("/api/profiles/");
		let response_data = await response.json();

		let profiles = [];
		response_data.forEach((profile) => {
			profiles.push(new Profile(this.client, profile.username, profile.id, profile.avatar));
		});
		return profiles;
	}

	/**
	 * 
	 * @param {String} username 
	 * @returns {?Promise<Profile>}
	 */
	async getProfile(username)
	{
		let profile = new Profile(this.client, username);
		if (await profile.init())
			return null;
		return profile;
	}

	/**
	 * 
	 * @param {Number} id 
	 * @returns {Profile}
	 */
	async getProfileId(id)
	{
		let profile = new Profile(this.client, undefined, id);
		if (await profile.init())
			return null;
		return profile;
	}
}

export {Profiles};
