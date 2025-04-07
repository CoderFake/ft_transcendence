import { client, reloadView } from "../index.js";
import { PongGame } from "../api/game/pong/PongGame.js";
import { PongPlayer } from "../api/game/pong/PongPlayer.js";
import AbstractAuthenticatedView from "./abstracts/AbstractAuthenticatedView.js";
import { Profile } from "../api/Profile.js";
import { PongMyPlayer } from "../api/game/pong/PongMyPlayer.js";

export default class PongOnlineView extends AbstractAuthenticatedView
{
	constructor(params)
	{
        super(params, 'Pong');

		/**
		 * @type {Number}
		 */
		this.game_id = params.id;
		
		/**
		 * @type {PongGame}
		 */
		this.game;

		/**
		 * @type {HTMLCanvasElement}
		 */
		this.canva;

		/**
		 * @type {CanvasRenderingContext2D}
		 */
		this.gameboard;

		/**
		 * @type {HTMLElement}
		 */
		this.gamestate;

		/**
		 * @type {HTMLTableElement}
		 */
		this.scoreboard;

		/**
		 * @type {HTMLElement}
		 */
		this.app = document.getElementById("app");

		/**
		 * @type {[]}
		 */
		this.keysPressed
	}

	createMyPlayer()
	{
		let index = this.game.players.findIndex((player) => player.id === client.me.id);

		if (index === -1)
			return;

		let myPlayer = this.game.players[index];

		if (myPlayer.isEliminated)
			return;

		this.keysPressed = [];

		this.myPlayer = new PongMyPlayer(client,
										 this.game,
										 myPlayer.score,
										 myPlayer.rail,
										 myPlayer.position,
										 myPlayer.isEliminated
										);

		myPlayer = this.myPlayer;

		this.registerKey();
	}

	keyReleaseHandler(event)
	{
		const idx = this.keysPressed.indexOf(event.key);
		if (idx != -1)
			this.keysPressed.splice(idx, 1);
	}

	keyPressHandler(event)
	{
		if (!this.keysPressed.includes(event.key))
			this.keysPressed.push(event.key);
	}

	registerKey()
	{
		this.keyPressHandler = this.keyPressHandler.bind(this);
		this.keyReleaseHandler = this.keyReleaseHandler.bind(this);
		document.addEventListener('keydown', this.keyPressHandler);
		document.addEventListener('keyup', this.keyReleaseHandler);
	}

	unregisterKey()
	{
		document.removeEventListener('keydown', this.keyPressHandler);
		document.removeEventListener('keyup', this.keyReleaseHandler);
	}

	/**
	 * @param {PongPlayer} player 
	 */
	async onGoal(player)
	{
		document.getElementById(`score-${player.id}`).innerText = player.score.length;
	}

	async onStart()
	{
		this.gamestate.innerHTML = this.game.getState();
	}

	/**
	 * @param {PongPlayer} winner 
	 */
	async onFinish(winner)
	{
		this.gamestate.innerHTML = this.game.getState();
		this.destroyGameboard();
		this.destroyButtons()
		this.displayWinner(winner)
	}

	async onDisconnect()
	{
		await reloadView();
	}

	createScoreboard()
	{
		this.scoreboard = document.createElement("table");

		this.app.appendChild(this.scoreboard);

		let row = document.createElement("tr");

		this.game.players.forEach(player => {
			let th = document.createElement("th");
			th.innerText = player.username;
			row.appendChild(th);
		});

		this.scoreboard.appendChild(row);

		row = document.createElement("tr");

		this.game.players.forEach(player => {
			let th = document.createElement("th");
			th.id = `score-${player.id}`;
			th.innerText = player.score.length;
			this.scoreboard.appendChild(th);
		});

		this.scoreboard.appendChild(row);
	}

	createGameboard()
	{
		this.canva = document.createElement("canvas");
		
		this.app.appendChild(this.canva)

		this.canva.height = this.game.config.MAP_SIZE_Y
		this.canva.width = this.game.config.MAP_SIZE_X

		this.gameboard = this.canva.getContext('2d');
	}

	createButtons()
	{
		this.upButton = document.createElement("button");
		this.downButton = document.createElement("button");

		this.upButton.id = "up";
		this.downButton.id = "down";

		this.downButton.onmousedown = () => {
			['s', 'a'].forEach(key => {
				this.keyPressHandler({key: key});
			});
		};
		this.downButton.onmouseup = () => {
			['s', 'a'].forEach(key => {
				this.keyReleaseHandler({key: key});
			});
		};
		this.downButton.ontouchstart = () => {
			['s', 'a'].forEach(key => {
				this.keyPressHandler({key: key});
			});
		};
		this.downButton.ontouchend = () => {
			['s', 'a'].forEach(key => {
				this.keyReleaseHandler({key: key});
			});
		};

		this.upButton.onmousedown = () => {
			['w', 'd'].forEach(key => {
				this.keyPressHandler({key: key});
			});
		};
		this.upButton.onmouseup = () => {
			['w', 'd'].forEach(key => {
				this.keyReleaseHandler({key: key});
			});
		};
		this.upButton.ontouchstart = () => {
			['w', 'd'].forEach(key => {
				this.keyPressHandler({key: key});
			});
		};
		this.upButton.ontouchend = () => {
			['w', 'd'].forEach(key => {
				this.keyReleaseHandler({key: key});
			});
		};

		this.app.appendChild(this.downButton);
		this.app.appendChild(this.upButton);
	}

	destroyButtons()
	{
		this.app.removeChild(this.upButton);
		this.app.removeChild(this.downButton);
	}

	destroyGameboard()
	{
		this.app.removeChild(this.canva);
	}

	/**
	 * 
	 * @param {Profile} winner 
	 */
	displayWinner(winner)
	{
		const winnerStand = document.createElement("h1");
		
		document.getElementById("app").appendChild(winnerStand);

		winnerStand.innerText = `winner: ${winner.username}`;
	}

	async connect()
	{
		await this.game.join();
		await this.game.waitInit();
	}

	async postInit()
	{
		this.gamestate = document.getElementById("gamestate");
		
		this.game = new PongGame(client, this.game_id, this.onStart.bind(this), this.onGoal.bind(this), this.onStart.bind(this), this.onFinish.bind(this));

		const errorCode = await this.game.init();
		if (errorCode)
			return errorCode;

		this.gamestate.innerHTML = this.game.getState();

		if (this.game.finished)
		{
			this.displayWinner(this.game.winner);
		}
		else
		{
			await this.connect();
			this.createScoreboard();
			this.createGameboard();
			this.createButtons();
			this.createMyPlayer();
			this.render();
		}
	}

	render()
	{
		let loop_id = setInterval(() => {
			if (this.game === undefined)
				clearInterval(loop_id);
			this.myPlayer?.updatePaddle(this.keysPressed);
			this.renderGame();
			this.game?.time?.new_frame();
			//clearInterval(loop_id);
		// 1 sec  fps
		}, 1000 / 60);
	}

	renderGame()
	{
		this.gameboard.beginPath();
		this.game.render(this.gameboard);
		this.gameboard.strokeStyle = "#000000";
		this.gameboard.lineWidth = 1;
		this.gameboard.stroke();
	}

	async getHtml()
	{
		return /* HTML */ `
			<link rel="stylesheet" href="/static/css/pongOnline.css">
			<h1 id='gamestate'></h1>
		`;
	}

	async leavePage()
	{
		this.unregisterKey();
		this.game.leave()
	}
}