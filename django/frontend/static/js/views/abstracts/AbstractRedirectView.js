import { navigateTo } from "../../index.js";
import AbstractView from "./AbstractView.js";

export default class extends AbstractView{
    constructor(params, titleKey, uri)
    {
        super(params, titleKey);
        this.redirect_url = uri;
    }

    async redirect()
    {
        navigateTo(this.redirect_url);
    }
}
