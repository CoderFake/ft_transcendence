import {client, lang, navigateTo} from '../index.js';
import {clearElements, fill_errors} from '../utils/formUtils.js'
import AbstractAuthenticatedView from './abstracts/AbstractAuthenticatedView.js';

export default class extends AbstractAuthenticatedView
{    
    constructor(params)
    {
        super(params, 'settingsWindowTitle');
		this.PROFILE_PICTURE_MAX_SIZE = 2 * 1024 * 1024; // 2MB
	}

    async postInit()
    {
		this.avatarInit();
		this.usernameInit();
		this.passwordInit();
		this.deleteInit();
    }

	deleteInit() {
		const deleteInput = document.getElementById('deleteInput');
		const deleteModal = document.getElementById('deleteModal');

		deleteModal.addEventListener('shown.bs.modal', _ => {
			deleteInput.focus();
		});
		deleteModal.addEventListener('hidden.bs.modal', _ => {
			deleteInput.value = '';
		});
		deleteInput.onkeydown = e => {
			if (e.key === 'Enter')
				this.deleteAccount();
		}
		document.getElementById('deleteButton').onclick = this.deleteAccount;
	}

	passwordInit() {
		document.getElementById('currentPasswordInput').onkeydown = e => {
			if (e.key === 'Enter')
				this.savePassword();
		};
		document.getElementById('newPasswordInput').onkeydown = e => {
			if (e.key === 'Enter')
				this.savePassword();
		};
		document.getElementById('newPassword2Input').onkeydown = e => {
			if (e.key === 'Enter')
				this.savePassword();
		};
		document.getElementById('passwordSave').onclick = this.savePassword;
	}

	usernameInit() {
		const usernameInput = document.getElementById('usernameInput');
		const usernameSave = document.getElementById('usernameSave');

		usernameInput.oninput = e => {
			const value = e.target.value;
			if (value != client.me.username && value.length)
				usernameSave.classList.remove('disabled');
			else
				usernameSave.classList.add('disabled');
		}
		usernameSave.onclick = _ => this.saveUsername();
	}

	avatarInit() {
		const avatar = document.getElementById('avatar');
		const avatarInput = document.getElementById('avatarInput');
		const avatarUpload = document.getElementById('avatarUpload');
		const avatarDelete = document.getElementById('avatarDelete');

		avatar.onclick = _ => avatarInput.click();
		avatarInput.onchange = function () {
			const selectedFile = this.files[0];
			if (!selectedFile)
				return;

			avatar.src = URL.createObjectURL(selectedFile);
			avatarUpload.classList.remove('d-none');
		}
		avatarUpload.onclick = _ => this.saveAvatar();
		avatarDelete.onclick = _ => this.deleteAvatar();
	}

	async displayAvatar() {
		let avatar = document.getElementById('avatar');
		avatar.src = client.me.avatar + '?t=' + new Date().getTime();
	}

	async savePassword() {
		const currentPasswordInput = document.getElementById('currentPasswordInput');
		const currentPassword = currentPasswordInput.value;
		const currentPasswordDetail = document.getElementById('currentPasswordDetail');
		const newPasswordInput = document.getElementById('newPasswordInput');
		const newPassword = newPasswordInput.value;
		const newPasswordDetail = document.getElementById('newPasswordDetail');
		const newPassword2Input = document.getElementById('newPassword2Input');
		const newPassword2 = newPassword2Input.value;
		const newPassword2Detail = document.getElementById('newPassword2Detail');
		const passwordDetail = document.getElementById('passwordDetail');

		clearElements('innerHTML', [currentPasswordDetail,
							newPasswordDetail,
							newPassword2Detail,
							passwordDetail
		]);
		currentPasswordInput.classList.remove('is-invalid');
		newPasswordInput.classList.remove('is-invalid');
		newPassword2Input.classList.remove('is-invalid');

		if (!currentPassword.length) {
			currentPasswordDetail.innerHTML = lang.get('errorEmptyField');
			currentPasswordInput.classList.add('is-invalid');
		}
		if (!newPassword.length) {
			newPasswordDetail.innerHTML = lang.get('errorEmptyField');
			newPasswordInput.classList.add('is-invalid');
		}
		if (!newPassword2.length) {
			newPassword2Detail.innerHTML = lang.get('errorEmptyField');
			newPassword2Input.classList.add('is-invalid');
		}
		if (!currentPassword.length || !newPassword.length || !newPassword2.length)
			return;

		const error = await client.account.updatePassword(currentPassword, newPassword, newPassword2);
		if (!error) {
			passwordDetail.classList.remove('text-danger');
			passwordDetail.classList.add('text-success');
			passwordDetail.innerHTML = lang.get('settingsPasswordSaved');
			setTimeout(_ => passwordDetail.innerHTML = '', 3000);
			clearElements('value', [currentPasswordInput, newPasswordInput, newPassword2Input]);
		} else {
			passwordDetail.classList.add('text-danger');
			passwordDetail.classList.remove('text-success');
			fill_errors(error, 'innerHTML');
			if (error.currentPasswordDetail)
				currentPasswordInput.classList.add('is-invalid');
			if (error.newPasswordDetail)
				newPasswordInput.classList.add('is-invalid');
			if (error.newPassword2Detail)
				newPassword2Input.classList.add('is-invalid');
		}
	}

	async saveUsername()
	{
		const usernameInput = document.getElementById('usernameInput');
		const username = usernameInput.value;
		const usernameDetail = document.getElementById('usernameDetail');

		if (!username.length || username === client.me.username)
			return;

		const error = await client.account.updateUsername(username);
		if (!error) {
			usernameDetail.classList.remove('text-danger', 'd-none');
			usernameDetail.classList.add('text-success');
			usernameDetail.innerHTML = lang.get('settingsUsernameSaved');
			setTimeout(_ => usernameDetail.classList.add('d-none'), 2000);
			document.getElementById('usernameSave').classList.add('disabled');
		} else {
			usernameDetail.classList.remove('text-success', 'd-none');
			usernameDetail.classList.add('text-danger');
			usernameDetail.innerHTML = error;
			document.getElementById('usernameSave').classList.add('disabled');
			console.log(error);
		}
	}

	async saveAvatar()
	{
		const avatarInput = document.getElementById('avatarInput');
		const selectedFile = avatarInput.files[0];
		const avatarDetail = document.getElementById('avatarDetail');

		if (!selectedFile)
			return;

		if (selectedFile.size > this.PROFILE_PICTURE_MAX_SIZE) {
			avatarDetail.classList.remove('text-success');
			avatarDetail.classList.add('text-danger');
			avatarDetail.innerHTML = lang.get('settingsAvatarTooLarge');
			return;
		}

		const error = await client.me.changeAvatar(selectedFile);
		if (!error) {
			avatarDetail.classList.remove('text-danger');
			avatarDetail.classList.add('text-success');
			avatarDetail.innerHTML = lang.get('settingsAvatarSaved');
			setTimeout(_ => avatarDetail.innerHTML = '', 2000);
			document.getElementById('avatarDelete').classList.remove('d-none');
			document.getElementById('avatarUpload').classList.add('d-none');
			avatarInput.value = null;
		} else {
			avatarDetail.classList.remove('text-success');
			avatarDetail.classList.add('text-danger');
			avatarDetail.innerHTML = error.avatar[0];
			document.getElementById('avatarUpload').classList.add('d-none');
			avatarInput.value = null;
			console.log(error);
		}
		this.displayAvatar();
	}

	async deleteAvatar() {
		const avatarDetail = document.getElementById('avatarDetail');

		const error = await client.me.deleteAvatar();
		if (!error) {
			avatarDetail.classList.remove('text-danger');
			avatarDetail.classList.add('text-success');
			avatarDetail.innerHTML = lang.get('settingsAvatarDeleted');
			setTimeout(_ => avatarDetail.innerHTML = '', 2000);
			document.getElementById('avatarDelete').classList.add('d-none');
		} else {
			avatarDetail.classList.remove('text-success');
			avatarDetail.classList.add('text-danger');
			avatarDetail.innerHTML = lang.get('settingsAvatarDeleteError');
		}
		this.displayAvatar();
	}

	async deleteAccount() {
		const passwordInput = document.getElementById('deleteInput');
		const password = passwordInput.value;
		const passwordDetail = document.getElementById('deleteDetail');

		passwordInput.classList.remove('is-invalid');
		passwordDetail.innerHTML = '';

		if (!password.length) {
			passwordInput.classList.add('is-invalid');
			passwordDetail.innerHTML = lang.get('errorEmptyField');
			return;
		}

		const error = await client.account.delete(password);
		if (!error) {
			passwordDetail.classList.replace('text-danger', 'text-success');
			passwordDetail.innerHTML = lang.get('settingsDeleteSuccess');
			setTimeout(_ => {
				bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
				navigateTo('/login');
			}, 2000);
			return;
		}
		passwordInput.classList.add('is-invalid');
		passwordDetail.innerHTML = error['password'];
	}

	async getHtml()
	{
		const avatarUnchanged = client.me.avatar === '/static/avatars/default.avif';

		return /* HTML */ `
		<div class='container-fluid col-lg-8 d-flex rounded border border-2 bg-light-subtle py-3'>
		  <div class='row col-4 bg-body-tertiary border rounded p-2 m-2 d-flex justify-content-center align-items-center'>
			<h2 class='border-bottom'>${lang.get('settingsAvatarTitle')}</h2>
			<img id='avatar' class='rounded p-0' src=${client.me.avatar} style='cursor: pointer;'>
			<input id='avatarInput' class='d-none' type='file' accept='image/*'>
			<div class='d-flex gap-2 mt-1 px-0'>
			  <span class='my-auto ms-1 me-auto' id='avatarDetail'></span>
			  <button class='btn btn-primary d-none' id='avatarUpload'>${lang.get('settingsAvatarSave')}</button>
			  <button class='btn btn-danger${avatarUnchanged ? ' d-none' : ''}' id='avatarDelete'>${lang.get('settingsAvatarDelete')}</button>
			</div>
		  </div>
		  <div class='flex-grow-1'>
			<h1 class='border-bottom ps-1 mb-3'>${lang.get('settingsTitle')}</h1>
			<div class='d-flex flex-column gap-2'>
			  <div>
				<div class='input-group'>
				  <div class='form-floating'>
					<input type='text' class='form-control' id='usernameInput' placeholder='${lang.get('settingsUsername')}' value=${client.me.username}>
					<label for='usernameInput'>${lang.get('settingsUsername')}</label>
				  </div>
				  <button class='input-group-text btn btn-success disabled' id='usernameSave'>${lang.get('settingsUsernameSave')}</button>
				</div>
				<span class='form-text' id='usernameDetail'></span>
			  </div>
			  <div class='flex-grow-1 p-1 border rounded bg-body-tertiary'>
				<h5 class='ps-1 border-bottom'>${lang.get('settingsPasswordTitle')}</h5>
				<div class='d-flex flex-column gap-1'>
				  <div class='form-floating'>
					<input type='password' class='form-control' id='currentPasswordInput' placeholder='${lang.get('settingsCurrentPassword')}'>
					<label for='currentPasswordInput'>${lang.get('settingsCurrentPassword')}</label>
				  </div>
				  <span class='text-danger ps-1' id='currentPasswordDetail'></span>
				  <div class='form-floating'>
					<input type='password' class='form-control' id='newPasswordInput' placeholder='${lang.get('settingsNewPassword')}'>
					<label for='newPassword2Input'>${lang.get('settingsNewPassword')}</label>
				  </div>
				  <span class='text-danger ps-1' id='newPasswordDetail'></span>
				  <div class='form-floating'>
					<input type='password' class='form-control' id='newPassword2Input' placeholder='${'settingsRepeatNewPassword'}'>
					<label for='newPassword2Input'>${lang.get('settingsRepeatNewPassword')}</label>
				  </div>
				  <span class='text-danger ps-1' id='newPassword2Detail'></span>
				  <div class='d-flex flex-row'>
					<span class='ps-1 my-auto text-danger' id='passwordDetail'></span>
					<button class='btn btn-success ms-auto' id='passwordSave'>${lang.get('settingsPasswordSave')}</button>
				  </div>
				</div>
			  </div>
			  <button class='btn btn-outline-danger' data-bs-toggle='modal' data-bs-target='#deleteModal'>${lang.get('settingsDeleteButton')}</button>
			  <div class='modal fade' id='deleteModal' tabindex='-1'>
				<div class='modal-dialog'>
				  <div class='modal-content'>
					<div class='modal-header bg-danger bg-gradient'>
					  <h1 class='modal-title fs-5'>${lang.get('settingsDeleteTitle')}</h1>
					  <button class='btn-close' data-bs-dismiss='modal'></button>
					</div>
					<div class='modal-body'>
					  <h6 class='form-label'>${lang.get('settingsDeleteConfirm')}</h6>
					  <input type='password' class='form-control' id='deleteInput' placeholder='${lang.get('settingsDeleteInput')}'>
					  <span class='form-text text-danger' id='deleteDetail'></span>
					</div>
					<div class='modal-footer'>
					  <button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>${lang.get('settingsDeleteCancel')}</button>
					  <button type='button' class='btn btn-danger' id='deleteButton'>${lang.get('settingsDeleteButton')}</button>
					</div>
				  </div>
				</div>
			</div>
		  </div>
		</div>
			`;
	}
}
