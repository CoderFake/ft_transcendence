import { client, navigateTo } from "../../index.js";
import AbstractAuthenticatedView from "../abstracts/AbstractAuthenticatedView.js";

export default class extends AbstractAuthenticatedView
{
	constructor(params, lastPageUrl = '/login') {
		super(params, 'logoutWindowTitle', lastPageUrl);
		this.lastPageUrl = lastPageUrl;
	}

	async postInit() {
		await client.logout();
		navigateTo(this.lastPageUrl);
	}
}
