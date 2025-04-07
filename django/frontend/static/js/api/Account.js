import { Client } from "./Client.js";

class Account
{
	/**
	 * @param  {Client} client
	 */
	constructor (client)
	{
		/**
		 * @type  {Client} client
		 */
		this.client = client;
	}

	/**
	 * @param {String} username 
	 * @param {String} password 
	 * @returns {Response}
	 */
	async create(username, password)
	{
		let response = await this.client._post("/api/accounts/register", {username: username, password: password});

		if (response.status === 201)
			await this.client._update_logged(true);

		return response;
	}

	/**
	 * @param {String} password 
	 * @returns {?Promise<Object>}
	 */
	async delete(password)
	{
		const response = await this.client._delete("/api/accounts/delete", {password: password});

		if (response.ok) {
			this.client._update_logged(false);
			return null;
		}

		return await response.json();
	}

	/**
		* @param {String} newUsername
		* @returns {?Promise<Object>}
	*/
	async updateUsername(newUsername)
	{
		const data = {
			username: newUsername
		};
		const response = await this.client._patch_json(`/api/accounts/update_profile`, data);
		const respondeData = await response.json();

		if (response.status === 200) {
			this.client.me.username = respondeData.username;
			document.getElementById('navbarDropdownButton').innerHTML = respondeData.username;
			document.getElementById('myProfileLink').href = '/profiles/' + respondeData.username;
			return null;
		}
		return respondeData['authorize'] || respondeData['detail'] || respondeData['username']?.join(' ') || 'Error.';
	}

	async updatePassword(currentPassword, newPassword, newPassword2)
	{
		const data = {
			current_password: currentPassword,
			new_password: newPassword,
			new_password2: newPassword2
		};
		const response = await this.client._put('/api/accounts/update_password', data);
		if (response.ok)
			return null;

		const responseData = await response.json();
		const formatedData = {};
		if (responseData['current_password'])
			formatedData['currentPasswordDetail'] = responseData['current_password'];
		if (responseData['new_password'])
			formatedData['newPasswordDetail'] = responseData['new_password'];
		if (responseData['new_password2'])
			formatedData['newPassword2Detail'] = responseData['new_password2'];
		if (formatedData == {})
			formatedData['passwordDetail'] = 'Error';
		return formatedData;
	}
}

export { Account };
