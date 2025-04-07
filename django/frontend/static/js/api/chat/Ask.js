import { lastView, navigateTo } from '../../index.js';
import Search from '../../views/Search.js';

export default class Ask {
	constructor(client) {
		this.client = client;
	}

	async ask_game(asked) {
		let response = await this.client._post(`/api/chat/ask/`, {
            asked:asked,
        });
	}
	
	async ask_game_accepted(asker) {
		let response = await this.client._post(`/api/chat/ask/accept/`, {
            asker:asker,
        });

        const statu = response.status;
        if (statu == 404 || statu == 204)
            return
        if (lastView instanceof Search)
            lastView.display_invite();

        const data = await response.json();
        await navigateTo(`/games/pong/${data.id_game}`);
	}

	async ask_game_refused(asker) {
		let response = await this.client._delete(`/api/chat/ask/`, {
            asker:asker,
        });

        const statu = response.status;
        if (statu == 404 || statu == 204)
            return
        if (lastView instanceof Search)
            lastView.display_invite();
	}

    async is_asked(asked) { 
		let response = await this.client._get(`/api/chat/ask/${asked}`);

        const statu = response.status;
        if (statu == 404 || statu == 204)
            return false;
        return true;
    }
}
