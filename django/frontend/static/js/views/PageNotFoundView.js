import AbstractView from "./abstracts/AbstractView.js";
import { lang } from '../index.js';

export default class extends AbstractView {
    constructor(params) {
        super(params, '404WindowTitle');
    }

	async getHtml() {
		return `
			<h1>404 Pong</h1>
			<img src="https://media.giphy.com/media/pm0BKtuBFpdM4/giphy.gif">
			<p>Git gud</p>
		`;
	}
}
