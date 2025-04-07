import { lang } from "../index.js";
import AbstractView from './abstracts/AbstractView.js'

export default class extends AbstractView {
	constructor(params)
	{
		super(params, 'DashboardTitle');
	}

	async getHtml() 
	{
		let textList = [""];
		let text = textList[Math.floor(Math.random() * textList.length)];
		return /* HTML */ `
		<style>
		body { height: 100vh; background-image: url(/static/js/imgs/ponge.gif); background-repeat: no-repeat;
		background-attachment: fixed;
		background-position: center;
		background-size: 100vw 100vh; overflow-y: hidden; }


		.center {
			margin: auto;
			width: 100%;
			text-align : center;
			padding: 10px;
		}
		.bottom-right {
			position: absolute;
    		bottom: 0;
    		right: 0;
    		padding: 5px;
		}
		</style>
		<div class="center">
		<p style="font-size : 100px">Pong Game</p>
		</div>
		<div class="bottom-right">
		${text}
		</div>
			`;
	}
}
