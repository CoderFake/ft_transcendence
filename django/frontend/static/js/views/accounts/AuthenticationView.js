import { client, lang, navigateTo } from "../../index.js";
import { clearIds, fill_errors } from "../../utils/formUtils.js";
import AbstractNonAuthenticatedView from "../abstracts/AbstractNonAuthenticatedView.js";

export default class extends AbstractNonAuthenticatedView
{
	constructor(params, lastUrlBeforeLogin = '/')
	{
		super(params, 'loginWindowTitle', lastUrlBeforeLogin);
		this.redirect_url = lastUrlBeforeLogin;
	}

	async leavePage()
	{
		this.current_mode = undefined;
	}

	/**
	 * @returns {Promise}
	 */
	async postInit()
	{
		let element = document.getElementById("toggle-register-login");

		element.onclick = this.toggle_register_login.bind(this);
	
		let new_mode = location.pathname.slice(1);
		this.update_mode(new_mode);

		document.getElementById("button").onclick = this.authentication.bind(this);

		let username_input = document.getElementById('username-input'),
			password_input = document.getElementById('password-input');
		
		[username_input, password_input].forEach(input => {
			input.addEventListener('keydown', async ev => {
				if (ev.key === 'Enter')
					await this.authentication.bind(this)();
			});
		});
		username_input.focus();
	}

	/**
	 * Check if field is normal
	 * @param username {String}
	 * @param password {String}
	 * @returns {Boolean}
	 */
	basic_verif(username, password)
	{
		if (username === '')
			document.getElementById('username').innerHTML = lang.get('errorEmptyField', 'This field may not be blank.');

		if (password === '')
			document.getElementById('password').innerHTML = lang.get('errorEmptyField', 'This field may not be blank.');
		
		if (username === '' || password === '')
			return false;

		return true;
	}

	/**
	 * @returns { undefined }
	 */
	toggle_register_login(event)
	{
		event.preventDefault();

		let new_mode = this.current_mode === "register" ? "login" : "register";

		this.update_mode(new_mode);
	}

	/**
	 * @param {String} new_mode 
	 */
	update_mode(new_mode)
	{
		if (new_mode === this.current_mode)
			return;

		this.current_mode = new_mode;

		let title = document.getElementById("title"),
			username_label = document.getElementById("username-label"),
			password_label = document.getElementById("password-label"),
			toggle_register_login = document.getElementById("toggle-register-login"),
			toggle_register_login_label = document.getElementById("toggle-register-login-label"),
			button = document.getElementById("button")
			;

		let title_text = this.current_mode === "register" ? "registerFormTitle" : "loginFormTitle"; 
		title.innerText = lang.get(title_text, "ERROR LANG");

		let username_label_text = this.current_mode === "register" ? "registerFormUsername" : "loginFormUsername"; 
		username_label.innerText = lang.get(username_label_text, "ERROR LANG");

		let password_label_text = this.current_mode === "register" ? "registerFormPassword" : "loginFormPassword"; 
		password_label.innerText = lang.get(password_label_text, "ERROR LANG");

		let toggle_register_login_label_text = this.current_mode === "register" ? "registerAlreadyAccount" : "loginNoAccount";
		toggle_register_login_label.innerText = lang.get(toggle_register_login_label_text, "ERROR LANG");

		let toggle_register_login_text = this.current_mode === "register" ? "registerLogin" : "loginRegister";
		toggle_register_login.innerText = lang.get(toggle_register_login_text, "ERROR LANG");

		let button_text = this.current_mode === "register" ? "registerFormButton" : "loginFormButton";
		button.innerText = lang.get(button_text, "ERROR LANG");

		this.titleKey = this.current_mode === 'register' ? 'registerWindowTitle' : 'loginWindowTitle';
		this.setTitle();

		document.getElementById('username-input').focus();
	}

	/**
	 * @returns {Promise}
	 */
	async authentication()
	{
		let username = document.getElementById("username-input").value,
			password = document.getElementById("password-input").value;

		if (!this.basic_verif())
			return;

		let response;

		if (this.current_mode === "register")
			response = await client.account.create(username, password);
		else
			response = await client.login(username, password);

		if (response.status === 200 || response.status === 201)
		{
			navigateTo(this.redirect_url);
			return;
		}

		let response_data = await response.json();

		clearIds("innerHTML", ["username", "password", 'login']);
		fill_errors(response_data, "innerHTML");
	}

	async getHtml()
	{
        return /* HTML */ `
			<div class='container-fluid'>
				<form class='border border-2 rounded bg-light-subtle mx-auto p-2 col-md-7 col-lg-4'>
					<h4 class='text-center fw-semibold mb-4' id="title">Loading...</h4>
					<div class='form-floating mb-2'>
						<input type='text' class='form-control' id='username-input' placeholder='Username'>
						<label for='usernameInput' id='username-label'>Loading...</label>
						<span class='text-danger' id='username'></span>
					</div>
					<div class='form-floating'>
						<input type='password' class='form-control' id='password-input' placeholder='Password'>
						<label for='password-input' id='password-label'>Loading...</label>
						<span class='text-danger' id='password'></span>
					</div>
					<div class='d-flex'>
						<button type='button' class='btn btn-primary mt-3 mb-2' id='button'>Loading...</button>
						<span class='text-danger my-auto mx-2' id='login'></span>
						<div class='ms-auto mt-auto flex-row d-flex gap-2' id="toggle">
							<p id='toggle-register-login-label'>Loading...</p>
							<a id="toggle-register-login" href='#'>Loading...</a>
						</div>
					</div>
				</form>
			</div>
        `;
	}
}
