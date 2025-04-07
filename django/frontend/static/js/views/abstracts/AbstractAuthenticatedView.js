import { client, navigateTo } from "../../index.js";
import AbstractRedirectView from "./AbstractRedirectView.js";

export default class extends AbstractRedirectView{
    constructor(params, titleKey, uri = "/login") {
		super(params, titleKey, uri);
    }

    async redirect()
    {
		if (await client.isAuthenticated() === false)
		{
			navigateTo(this.redirect_url);
			return 1;
		}
		return 0;
    }
}
