import { client, lang, navigateTo } from "../index.js";
import { clearIds, fill_errors } from "../utils/formUtils.js";
import AbstractAuthenticatedView from "./abstracts/AbstractAuthenticatedView.js";

export default class extends AbstractAuthenticatedView {

    constructor(params)
    {
		super(params, "Matchmaking");
    }

    async toggle_search()
    {
        clearIds("innerText", ["detail"]);
        if (client.matchmaking.searching)
        {
            client.matchmaking.stop();
            this.button.innerHTML = lang.get("matchmakingStartSearch");
        }
        else
        {
            await client.matchmaking.start(this.onreceive.bind(this), this.ondisconnect.bind(this), this.game_type_input.value, this.nb_players_input.value);

            this.button.innerHTML = lang.get("matchmakingStopSearch");
        }
    }

    ondisconnect(event)
    {
        this.button.innerHTML = lang.get("matchmakingStartSearch");
    }

    onreceive(data)
    {
        if (data.detail === "game_found")
        {
            navigateTo(`/games/${data.game_type}/${data.game_id}`);
            return;
        }
        this.display_data(data);
    }

    display_data(data)
    {
        clearIds("innerText", ["detail"]);
        fill_errors(data, "innerText");
    }

    addEnterEvent()
    {
        [this.nb_players_input, this.game_type_input].forEach((input) => {

            input.addEventListener('keydown', async ev => {

                if (ev.key !== 'Enter')
                    return;

                await this.toggle_search.bind(this);
            });
        });
    }

    addChangeNbPlayersEvent()
    {
        let update = () => {
            this.button.disabled = (this.nb_players_input.value < 2 || this.nb_players_input.value > 4);
        };

        ["change", "oninput"].forEach((event_name) => {
            this.nb_players_input.addEventListener(event_name, update);
        });
    }

    addChangegame_typeEvent()
    {
        let nb_players_div = document.getElementById("nb-players-div");
     
        this.game_type_input.addEventListener("change", () => {

            nb_players_div.style.display = 'block';

            client.matchmaking.stop();
            clearIds("innerText", ["detail"]);
        });
    }

    addEvents()
    {
        this.addEnterEvent();
        this.addChangegame_typeEvent();
        this.addChangeNbPlayersEvent();
    }

    async postInit()
    {
        this.button = document.getElementById("toggle-search");
        this.nb_players_input = document.getElementById("nb-players-input");
        this.game_type_input = document.getElementById("game-type-input");

        this.button.onclick = this.toggle_search.bind(this);

        this.addEvents()
    }

    async getHtml() {
        return /* HTML */ `
        <div class='container-fluid'>
            <div class='border border-2 rounded bg-light-subtle mx-auto p-2 col-md-7 col-lg-4'>
                <h4 class='text-center fw-semibold mb-4' id="title">${lang.get("matchmakingTitle")}</h4>
                <div>
                    <div class='form-floating mb-2' id='game_type-div'>
                        <select class='form-control' id='game-type-input'>
                            <option value='pong'>Pong</option>
                        </select>
                        <label for='game-type-input'>${lang.get("gamemodeChoice")}</label>
                    </div>
                    <div class='form-floating mb-2' id='nb-players-div'>
                        <input type='number' min='2' value='2' max='4' class='form-control' id='nb-players-input' placeholder='${lang.get("matchmakingNbPlayers")}'>
                        <label for='nb-players-input' id='username-label'>${lang.get("matchmakingNbPlayers")}</label>
                        <span class='text-danger' id='username'></span>
                    </div>
                    <div class='d-flex'>
                        <button type='button' class='btn btn-primary mt-3 mb-2 mx-2' id='toggle-search'>${lang.get("matchmakingStartSearch")}</button>
                        <span class='text-danger my-auto mx-2' id='detail'></span>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    async leavePage()
    {
		await client.matchmaking.stop();
    }
}
