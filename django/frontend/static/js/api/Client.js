import { Account } from "./Account.js";
import { MatchMaking } from "./Matchmaking.js";
import { Profiles } from "./Profiles.js";
import { MyProfile } from "./MyProfile.js";
import Notice from "./Notice.js";
import LanguageManager from './LanguageManager.js';

function getCookie(name)
{
	let cookie = {};
	document.cookie.split(';').forEach(function(el) {
		let split = el.split('=');
		cookie[split[0].trim()] = split.slice(1).join("=");
	});
	return cookie[name];
}

class Client
{
	/**
	 * 
	 * @param {String} url 
	 */
	constructor(url)
	{
		/**
		 * @type {String}
		 */
		this._url = url;

		/**
		 * @type {Account}
		 */
		this.account = new Account(this);

		/**
		 * @type {Profiles}
		 */
		this.profiles = new Profiles(this);

		/**
		 * @type {MatchMaking}
		 */
		this.matchmaking = new MatchMaking(this);

		/**
		 * @type {Boolean} A private var represent if the is is log NEVER USE IT use await isAuthenticated()
		 */
		this._logged = undefined;

		/**
		 * @type {Notice}
		 */
		this.notice = new Notice(this);

		this.lang = new LanguageManager();

	}

	/**
	 * The only right way to determine is the user is logged
	 * @returns {Promise<Boolean>}
	 */
	async isAuthenticated()
	{
		if (this._logged == undefined)
			this._logged = await this._test_logged();
		return this._logged;
	}

	/**
	 * Send a GET request to %uri%
	 * @param {String} uri 
	 * @param {*} data 
	 * @returns {Promise<Response>}  
	 */
	async _get(uri, data)
	{
		let response = await fetch(this._url + uri, {
			method: "GET",
			headers: {
				'Accept-Language': this.lang.currentLang
			},
			body: JSON.stringify(data),
		});
		return response;
	}

	/**
	 * Send a POST request
	 * @param {String} uri 
	 * @param {*} data 
	 * @returns {Promise<Response>} 
	 */
    async _post(uri, data)
    {
        let response = await fetch(this._url + uri, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCookie("csrftoken"),
				'Accept-Language': this.lang.currentLang,
			},
			body: JSON.stringify(data),
		});
        return response;
    }

	/**
	 * Send a DELETE request
	 * @param {String} uri 
	 * @param {String} data 
	 * @returns {Promise<Response>} 
	 */
	async _delete(uri, data)
    {
        let response = await fetch(this._url + uri, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": getCookie("csrftoken"),
				'Accept-Language': this.lang.currentLang,
			},
			body: JSON.stringify(data),
		});
        return response;
    }

	/**
	 * Send a PUT request with json
	 * @param {String} uri 
	 * @param {*} data 
	 * @returns {Promise<Response>} 
	 */
	async _put(uri, data)
    {
        let response = await fetch(this._url + uri, {
			method: "PUT",
			headers: {
				"X-CSRFToken": getCookie("csrftoken"),
				"Content-Type": "application/json",
				'Accept-Language': this.lang.currentLang,
			},
			body: JSON.stringify(data),
		});
        return response;
    }

	/**
	 * Send a PATCH request with json
	 * @param {String} uri 
	 * @param {*} data 
	 * @returns {Promise<Response>} 
	 */
	async _patch_json(uri, data)
    {
        let response = await fetch(this._url + uri, {
			method: "PATCH",
			headers: {
				"X-CSRFToken": getCookie("csrftoken"),
				"Content-Type": "application/json",
				'Accept-Language': this.lang.currentLang,
			},
			body: JSON.stringify(data),
		});
        return response;
    }

	/**
	 * Send a PATCH request with file
	 * @param {String} uri 
	 * @param {*} file 
	 * @returns {Promise<Response>}
	 */
	async _patch_file(uri, file)
    {
        let response = await fetch(this._url + uri, {
			method: "PATCH",
			headers: {
				"X-CSRFToken": getCookie("csrftoken"),
				'Accept-Language': this.lang.currentLang,
			},
			body: file,
		});
        return response;
    }

	/**
	 * Change logged state. Use It if you recv an 403 error
	 * @param {Promise<?>} state 
	 * @returns 
	 */
	async _update_logged(state)
	{
		if (this._logged == state)
			return;

		if (state)
		{
			this.me = new MyProfile(this);
			await this.me.init();
			this.notice.start();
			document.getElementById('navbarLoggedOut').classList.add('d-none');
			document.getElementById('navbarLoggedIn').classList.remove('d-none');
			document.getElementById('navbarDropdownButton').innerHTML = this.me.username;
			document.getElementById('myProfileLink').href = '/profiles/' + this.me.username;
		}
		else
		{
			this.me = undefined;
			await this.notice.stop();
			document.getElementById('navbarLoggedOut').classList.remove('d-none');
			document.getElementById('navbarLoggedIn').classList.add('d-none');
			document.getElementById('navbarDropdownButton').innerHTML = 'Me';
			document.getElementById('myProfileLink').href = '';
		}
		this._logged = state;
	}

	/**
	 * Loggin the user
	 * @param {String} username 
	 * @param {String} password 
	 * @returns {Promise<Response>}
	 */
	async login(username, password)
	{
		let response = await this._post("/api/accounts/login", {username: username, password: password});
		if (response.status == 200)
			await this._update_logged(true);

		return response;
	}

	/**
	 * Logout the user
	 * @returns {Promise<?>}
	 */
	async logout()
	{
		await this._get("/api/accounts/logout");
		await this._update_logged(false);
	}

	/**
	 * Determine if the user is logged. NEVER USE IT, USE isAuthenticated()
	 * @returns {Promise<Boolean>}
	 */
	async _test_logged()
	{
		let response = await this._get("/api/accounts/logged");

		await this._update_logged(response.status === 200);
		return response.status === 200;
	}
}

export {Client};
