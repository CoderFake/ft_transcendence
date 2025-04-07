import {lang} from '../../index.js';

export default class {
    constructor(params, titleKey) {
        this.params = params;
        this.titleKey = titleKey;
    }

	async postInit() {
	}

	async leavePage() {
	}

    setTitle() {
        document.title = lang.get(this.titleKey, this.titleKey);
    }

    async getHtml() {
        return "";
    }
}
