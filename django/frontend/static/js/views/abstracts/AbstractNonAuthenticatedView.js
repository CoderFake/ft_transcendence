import { client, navigateTo } from "../../index.js";
import AbstractRedirectView from "./AbstractRedirectView.js";

export default class extends AbstractRedirectView{
    constructor(params, titleKey, uri = "/home") {
		super(params, titleKey, uri);
    }

    async redirect()
    {
		if (await client.isAuthenticated() === false)
			return 0;
		navigateTo(this.redirect_url);
		return 1;
    }
}
