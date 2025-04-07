import { lang } from "../index.js";
import AbstractView from './abstracts/AbstractView.js'

export default class extends AbstractView {
	constructor(params) {
		super(params, 'homeWindowTitle');
	}

	async getHtml() {
		return /* HTML */ `
			<h1>${lang.get('homeTitle', 'Home')}</h1>
			<div class="d-flex flex-row" style="justify-content: center">
				<div class="row">
					<div class="col">
						<div class="card" style="width: 25rem;">
						<img src="/static/js/imgs/pongee.png" class="card-img-top" alt="Screenshot of Pong">
						<div class="card-body">
							<h5 class="card-title">${lang.get('homeOnline')}</h5>
							<p class="card-text">${lang.get('matchmakingPresentation')}</p>
							<a href="/matchmaking" class="btn btn-primary">${lang.get('homeOnline')}</a>
						</div>
						</div>
					</div>
					<div class="col">
						<div class="card" style="width: 25rem;">
						<img src="/static/js/imgs/pongee.png" class="card-img-top" alt="Screenshot of Pong">
						<div class="card-body">
							<h5 class="card-title">${lang.get('homePongOffline')}</h5>
							<p class="card-text">${lang.get('offlinePongPresentation')}</p>
							<a href="/games/pong/offline" class="btn btn-primary">${lang.get('homePongOffline')}</a>
						</div>
						</div>
					</div>
				</div>
			</div>
			`;
	}
}
