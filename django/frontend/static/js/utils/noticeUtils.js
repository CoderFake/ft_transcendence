export function createNotification(title = 'New notification', content, delay = 3000) {

	const toastElement = document.createElement('div');
	toastElement.classList.add('toast');
	toastElement.role = 'alert';
	toastElement.setAttribute('data-bs-delay', delay);
	toastElement.innerHTML =
		`<div class='toast-header'>
			<strong class='me-auto'>${title}</strong>
			<button type='button' class='btn-close' data-bs-dismiss='toast'></button>
		</div>
		<div class='toast-body'>${content}</div>`
	toastElement.addEventListener('hidden.bs.toast', e => e.target.remove());
	new bootstrap.Toast(toastElement).show();

	const toastContainer = document.getElementById('toastContainer');
	toastContainer.insertBefore(toastElement, toastContainer.firstChild);
}
