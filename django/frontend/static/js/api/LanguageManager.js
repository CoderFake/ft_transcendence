import { reloadView } from '../index.js';

export default class LanguageManager {
	constructor() {
		this.availableLanguages = ['vi', 'en'];

		this.dict = null;
		this.currentLang = 'vi';
		this.chosenLang = localStorage.getItem('preferedLanguage') || 'vi';
		if (this.chosenLang !== this.currentLang && this.availableLanguages.includes(this.chosenLang)) {
			this.loading = this.translatePage();
			this.currentLang = this.chosenLang;
		} else {
			this.loading = this.loadDict(this.chosenLang);
		}
		document.getElementById('languageDisplay').innerHTML =
			document.querySelector(`#languageSelector > [value=${this.currentLang}]`)?.innerHTML;
	}

	async translatePage() {
		if (this.currentLang === this.chosenLang)
			return;

		await this.loadDict(this.chosenLang);
		if (!this.dict)
			return 1;

		document.querySelectorAll('[data-i18n]').forEach(el => {
			let key = el.getAttribute('data-i18n');
			el.innerHTML = this.dict[key];
		});
		await reloadView();

		return 0;
	}

	async changeLanguage(lang) {
		if (lang === this.currentLang || !this.availableLanguages.includes(lang))
			return 1;

		this.chosenLang = lang;
		if (await this.translatePage() !== 0)
			return 1;

		this.currentLang = this.chosenLang;
		localStorage.setItem('preferedLanguage', lang);
		document.getElementById('languageDisplay').innerHTML =
			document.querySelector(`#languageSelector > [value=${this.currentLang}]`)?.innerHTML;
		return 0;
	}

	async loadDict(lang) {
		let dictUrl = `${location.origin}/static/js/lang/${lang}.json`;
		let response = await fetch(dictUrl);

		if (response.status !== 200) {
			console.log(`No translation found for language ${lang}`);
			return;
		}

		this.dict = await response.json();
	}

	async waitLoading() {
		await this.loading;
	}

	get(key, defaultTxt) {
		if (!this.dict)
			return defaultTxt;

		return this.dict[key] || defaultTxt;
	}
}
