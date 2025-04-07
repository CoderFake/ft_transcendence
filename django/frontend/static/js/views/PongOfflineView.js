import AbstractView from "./abstracts/AbstractView.js";
import "../3D/maths/gl-matrix-min.js"
import { initShaderProgram } from "../3D/shaders.js"
import { initBuffers } from "../3D/buffers.js"
import { renderCube } from "../3D/cube.js"

export class PongOfflineView extends AbstractView {
	constructor(params) {
		super(params, 'Game');
		this.init();
	}

	init(round) {
		this.game = null;
		this.player1 = "Player 1";
		this.player2 = "Player 2";
		this.player3 = "Player 3";
		this.player4 = "Player 4";

		this.winner1 = undefined;
		this.winner2 = undefined;

		this.final_winner = undefined;
		this.round = -1; 

		this.game_mode = 1; // 1 is 2D, 2 is 3D
	}

	async getHtml() {
		return `
			<link rel="stylesheet" href="/static/css/gameOffline.css">
			<h1>Game</h1>
			<button id='startGameButton'>Start Game</button>
			<button id='resetGameButton'>Reset Game</button>
			<button id='stopGameButton'>Stop Game</button>
			<button id='startTournament'>Start Tournament</button>
			<button id='gameMode'>Switch to 3D</button>
			<div id="display"></div>
			<div id="display-button"></div>
			<svg id="tree" height="3000" width="3000"></svg>
		`;
	}

	async postInit() {
		this.app = document.getElementById("display");
		document.getElementById('startGameButton').onclick = this.startGame.bind(this);
		document.getElementById('resetGameButton').onclick = this.resetGame.bind(this);
		document.getElementById('resetGameButton').hidden = 1;
		document.getElementById('stopGameButton').onclick = this.stopGame.bind(this);
		document.getElementById('stopGameButton').hidden = 1;
		document.getElementById('startTournament').onclick = this.startTournament.bind(this);
		document.getElementById('gameMode').hidden = 1;
		document.getElementById('gameMode').onclick = this.toggleGameMode.bind(this);
	}

	async leavePage() {
		this.game?.cleanup();
	}

	async toggleGameMode()
	{
		if(this.game_mode === 1) // 3D
		{
			this.game_mode = 2;
			document.getElementById("gameMode").innerText = "Switch to 2D";
		}
		else if(this.game_mode === 2) // 2D
		{
			this.game_mode = 1;
			document.getElementById("gameMode").innerText = "Switch to 3D";
		}
		this.game.changeGameMode(this.game_mode);
	}

	startTournament() {
		let startTournament = document.getElementById("startTournament");
		let player1 = document.createElement("input");
		player1.id="player1"; player1.type="text"; player1.name="message"; player1.placeholder="Player 1"; player1.maxLength=10; player1.value = "";
		startTournament.before(player1);

		let player2 = document.createElement("input");
		player2.id="player2"; player2.type="text"; player2.name="message"; player2.placeholder="Player 2"; player2.maxLength=10; player2.value = "";
		player1.after(player2);

		let player3 = document.createElement("input");
		player3.id="player3"; player3.type="text"; player3.name="message"; player3.placeholder="Player 3"; player3.maxLength=10; player3.value = "";
		player2.after(player3);

		let player4 = document.createElement("input");
		player4.id="player4"; player4.type="text"; player4.name="message"; player4.placeholder="Player 4"; player4.maxLength=10; player4.value = "";
		player3.after(player4);

		startTournament.onclick = () => {
			if (player1.value.length > 0)
				this.player1 = player1.value;
			if (player2.value.length > 0)
				this.player2 = player2.value;
			if (player3.value.length > 0)
				this.player3 = player3.value;
			if (player4.value.length > 0)
				this.player4 = player4.value;

			player1.remove();
			player2.remove();
			player3.remove();
			player4.remove();

			this.round = 0;

			this.startGame(this.player1, this.player2);
			startTournament.onclick = this.startTournament.bind(this);
		}
	}

	createButton()
	{
		this.up1 = document.createElement("button");
		this.up1.textContent = "↑";
		this.up1.id = "up1";

		this.down1 = document.createElement("button");
		this.down1.textContent = "↓";
		this.down1.id = "down1";

		this.up2 = document.createElement("button");
		this.up2.textContent = "↑";
		this.up2.id = "up2";

		this.down2 = document.createElement("button");
		this.down2.textContent = "↓";
		this.down2.id = "down2";

		this.up1.setAttribute("user_id", 1);
		this.up1.setAttribute("direction", "up");
		this.up2.setAttribute("user_id", 2);
		this.up2.setAttribute("direction", "up");

		this.down1.setAttribute("user_id", 1);
		this.down1.setAttribute("direction", "down");
		this.down2.setAttribute("user_id", 2);
		this.down2.setAttribute("direction", "down");

		document.addEventListener('touchstart', this.keyDownHandler);
		document.addEventListener('touchend', this.keyUpHandler);
		[this.up1, this.up2, this.down1, this.down2].forEach(button => {
			button.onmousedown = this.game.keyDownHandler.bind(this.game);
			button.onmouseup = this.game.keyUpHandler.bind(this.game);
			button.ontouchstart = this.game.keyDownHandler.bind(this.game);
			button.ontouchend = this.game.keyUpHandler.bind(this.game);
		});

		document.getElementById("display-button").append(this.up1, this.down1);
		document.getElementById("display-button").append(this.up2, this.down2);
	}

	resetGame(player1, player2) {
		if (this.round >= 0)
			this.round = 0;

		this.winner1 = undefined;
		this.winner2 = undefined;
		this.final_winner = undefined;

		this.startGame(player1, player2)
	}

	async startGame(player1, player2) {
		if (player1 == null || player2 == null) {
			player1 = this.player1;
			player2 = this.player2;
		}
		if (this.game == null) {
			this.game = new Game(this.game_mode, this, player1, player2);
			this.createButton();
		}
		else {
			this.app.removeChild(this.game.canvas);
			this.app.removeChild(this.game.scoresDisplay);
			this.game.cleanup();
			this.game = new Game(this.game_mode, this, player1, player2);
			this.createButton();
		}

		if (this.round >= 0)
			await this.display_tree_tournament();

		document.getElementById('startTournament').hidden = 1;
		document.getElementById('startGameButton').hidden = 1;
		document.getElementById('stopGameButton').hidden = 0;
		document.getElementById('resetGameButton').hidden = 0;
		document.getElementById('gameMode').hidden = 0;
	}

	stopGame() {
		if (!this.game)
			return;
		this.app.removeChild(this.game.canvas);
		this.app.removeChild(this.game.scoresDisplay);
		this.game.cleanup();
		this.init();
		document.getElementById('startGameButton').innerHTML = 'Start Game';
		document.getElementById('startTournament').hidden = 0;
		document.getElementById('startGameButton').hidden = 0;
		document.getElementById('stopGameButton').hidden = 1;
		document.getElementById('resetGameButton').hidden = 1;
		document.getElementById('gameMode').hidden = 1;
		this.app.style.maxWidth = null;

	}

	async display_tree_tournament() {
		let players = [this.player1, this.player2, this.player3, this.player4, this.winner1, this.winner2, this.final_winner];
		const svg = document.getElementById('tree');
		  
		svg.innerHTML = '';

		let width = 150;
		let height = 40;
		let gap_y = height + 25;
		let gap_x = width + 25;
		let start_y = height / 2;

		let rounds = Math.log2(4) + 1; 

		let k = 0;
		for (let i = 0; i < rounds; i++) { 
			let number_square = 4 / Math.pow(2, i)
			for(let j = 0; j < number_square; j++) {
				const y = start_y + gap_y * j * Math.pow(2, i) + (gap_y / 2 * Math.pow(2, i));
				svg.appendChild(await this.create_square(gap_x * i, y, width, height, "white", "black", players[k]));
				svg.appendChild(await this.create_text(gap_x * i, y, width, height, "white", "black", players[k]));
				k++;
			}
		}
	}

	async create_square(x, y, width, height, fill, stroke, text) {
		const square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		square.setAttribute("id", "square")
		square.setAttribute("x", x);
		square.setAttribute("y", y);
		square.setAttribute("width", width);
		square.setAttribute("height", height);
		square.setAttribute("fill", fill);
		square.setAttribute("stroke", stroke);

		return square
	}

	async create_text(x, y, width, height, fill, stroke, text) {
		const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
		textElement.setAttribute("id", "textElement")
		textElement.setAttribute("x", x);
		textElement.setAttribute("y", y + height / 2 + 5);
		textElement.setAttribute("font-family", "Arial")
		textElement.setAttribute("font-size", "20")
		textElement.setAttribute("fill", stroke);
		textElement.setAttribute("stroke", fill);

		if (text == undefined)
			text = "";
		textElement.appendChild(document.createTextNode(text));

		return textElement;
	}
}

class Game {
	constructor(game_mode, this_pong, player_name1, player_name2) {

		this.pong = this_pong;

		//Global variables
		this.def = {
			CANVASHEIGHT: 270,
			CANVASWIDTH: 480,
			PADDLEHEIGHT: 70,
			PADDLEWIDTH: 10,
			PADDLEMARGIN: 5,
			PADDLESPEED: 3,
			BALLRADIUS: 5,
			BALLSPEED: 2,
            BALLMAXSPEED: 10,
			BALLSPEEDINCR: 0.2,
			MAXBOUNCEANGLE: 10 * (Math.PI / 12),
			MAXSCORE: 2
		};

		this.app = document.getElementById("display");
		this.app.style.maxWidth = Number(this.def.CANVASWIDTH) + "px";

		this.canvas = null;
		this.context = null;

		this.player_name1 = player_name1;
		this.player_name2 = player_name2;

		this.scoresDisplay = document.createElement('p');
		this.scoresDisplay.innerHTML = `${this.player_name1}: 0 - ${this.player_name2}: 0`;
		this.app.appendChild(this.scoresDisplay);

		this.players = [
			{
				paddle: new Paddle(this.def.PADDLEMARGIN, this.def),
				score: 0
			},
			{
				paddle: new Paddle(this.def.CANVASWIDTH - this.def.PADDLEMARGIN - this.def.PADDLEWIDTH, this.def),
				score: 0
			}
		];
		this.ballStartSide = 0;
		this.ballRespawned = false;
		this.ball = new Ball(this.def, this.ballStartSide, this.context);

		this.interval = setInterval(this.updateGame.bind(this), 10);

		this.keys = [];
		this.keyUpHandler = this.keyUpHandler.bind(this);
		this.keyDownHandler = this.keyDownHandler.bind(this);
		document.addEventListener('keydown', this.keyDownHandler);
		document.addEventListener('keyup', this.keyUpHandler);

		// stufs for 3D
		this.shader_prog = null;
		this.buffers = null;
		this.cam_pos = [0, 150, -10];
		this.cam_target = [0, 0, 0];
		this.cam_up = [0, 0, -1];

		this.initGame(game_mode);
	}

	initGame(mode)
	{
		if(mode === 1)
			this.init2D();
		else if(mode === 2)
			this.initWebGL();
	}

	initWebGL()
	{
		this.canvas = document.createElement("canvas");
		this.canvas.width = this.def.CANVASWIDTH;
		this.canvas.height = this.def.CANVASHEIGHT;
		this.canvas.id = "gameCanvas";
		this.canvas.style.border = '1px solid #d3d3d3';
		this.canvas.style.backgroundColor = '#f1f1f1';
		this.app.appendChild(this.canvas);

		this.context = this.canvas.getContext("webgl");

		if(this.context === null)
		{
			alert("Unable to initialize WebGL. Your browser or machine may not support it. You may also be a Pong");
			return;
		}

		this.shader_prog = initShaderProgram(this.context);
		this.buffers = initBuffers(this.context);

		this.context.enable(this.context.CULL_FACE);
		this.context.cullFace(this.context.BACK);
	}

	init2D()
	{
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'gameCanvas';
		this.canvas.width = this.def.CANVASWIDTH;
		this.canvas.height = this.def.CANVASHEIGHT;
		this.canvas.style.border = '1px solid #d3d3d3';
		this.canvas.style.backgroundColor = '#f1f1f1';
		this.context = this.canvas.getContext('2d');
		this.app.appendChild(this.canvas);
	}

	changeGameMode(mode)
	{
		this.app.removeChild(this.canvas);
		this.initGame(mode);
	}

	finish(winner) {
		this.cleanup();
		if (this.pong.round >= 0) {
			if (this.pong.round == 0) {
				this.pong.winner1 = winner;
				this.pong.startGame(this.pong.player3, this.pong.player4)
				this.pong.round++;
			}
			else if (this.pong.round == 1) {
				this.pong.winner2 = winner;
				this.pong.startGame(this.pong.winner1, this.pong.winner2)
				this.pong.round++;
			}
			else {
				this.pong.final_winner = winner;
				this.pong.display_tree_tournament();
				this.scoresDisplay.innerHTML = winner + ' wins!! GGS';
			}
		}
		else
			this.scoresDisplay.innerHTML = winner + ' wins!! GGS';
	}

	cleanup() {
		clearInterval(this.interval);
		document.removeEventListener('keydown', this.keyDownHandler);
		document.removeEventListener('keyup', this.keyUpHandler);
		this.canvas.style.display = 'none';
		["up1", "up2", "down1", "down2", "player_name1", "player_name2"].forEach(button => {
			if (document.getElementById(button) != null)
				document.getElementById(button).remove();
		}); 
		let svg = document.getElementById("tree");
		while (svg.firstChild)
			svg.removeChild(svg.firstChild);
	}

	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	updateGame() {
		//Paddle movement
		if ((this.keys.includes('s') || this.keys.includes('down1')) &&
			this.players[0].paddle.y + this.def.PADDLEHEIGHT < this.def.CANVASHEIGHT - this.def.PADDLEMARGIN)
				this.players[0].paddle.y += this.def.PADDLESPEED;
		if ((this.keys.includes('w') || this.keys.includes('up1')) &&
			this.players[0].paddle.y > 0 + this.def.PADDLEMARGIN)
				this.players[0].paddle.y -= this.def.PADDLESPEED;

		if ((this.keys.includes('ArrowDown') || this.keys.includes('down2')) &&
			this.players[1].paddle.y + this.def.PADDLEHEIGHT < this.def.CANVASHEIGHT - this.def.PADDLEMARGIN)
				this.players[1].paddle.y += this.def.PADDLESPEED;
		if ((this.keys.includes('ArrowUp') || this.keys.includes('up2')) &&
			this.players[1].paddle.y > 0 + this.def.PADDLEMARGIN)
				this.players[1].paddle.y -= this.def.PADDLESPEED;

		//GOOAAAAL
		if (this.ball.x <= 0)
			this.updateScore.bind(this)(this.players[0].score, ++this.players[1].score);
		else if (this.ball.x >= this.def.CANVASWIDTH)
			this.updateScore.bind(this)(++this.players[0].score, this.players[1].score);

		//Ball collisions
		if (this.detectCollision(this.players[0].paddle, this.ball))
			this.calculateBallVelocity(this.players[0].paddle.getCenter().y, this.ball);
		else if (this.detectCollision(this.players[1].paddle, this.ball))
			this.calculateBallVelocity(this.players[1].paddle.getCenter().y, this.ball, -1);

		if (this.ball.y - this.ball.radius <= 0)
			this.ball.vy *= -1;
		else if (this.ball.y + this.ball.radius >= this.canvas.height)
			this.ball.vy *= -1;

		if (!this.ballRespawned) {
			this.ball.x += this.ball.vx;
			this.ball.y += this.ball.vy;
		}

		if(this.context instanceof CanvasRenderingContext2D)
		{
			this.clear();
		}
		else if(this.context instanceof WebGLRenderingContext)
		{
			this.context.clearColor(0.1, 0.1, 0.1, 1.0);
			this.context.clearDepth(1.0);
			this.context.enable(this.context.DEPTH_TEST);
			this.context.depthFunc(this.context.LEQUAL);
			this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);

			const projectionMatrix = mat4.create();
			const viewMatrix = mat4.create();

			mat4.perspective(projectionMatrix, (90 * Math.PI) / 180, this.context.canvas.clientWidth / this.context.canvas.clientHeight, 0.1, 10000000.0);
			mat4.lookAt(viewMatrix, this.cam_pos, this.cam_target, this.cam_up);

			this.setPositionAttribute();
			this.setNormalAttribute();

			this.context.useProgram(this.shader_prog.program);

			this.context.uniformMatrix4fv(this.shader_prog.uniformLocations.projectionMatrix, false, projectionMatrix);
			this.context.uniformMatrix4fv(this.shader_prog.uniformLocations.viewMatrix, false, viewMatrix);
		}
		else
		{
			alert('Unknown rendering context type');
		}
		this.players[0].paddle.update(this.context, this.shader_prog);
		this.players[1].paddle.update(this.context, this.shader_prog);
		this.ball.update(this.context, this.shader_prog);
	}

	updateScore(p1Score, p2Score) {
		if (p1Score > this.def.MAXSCORE) {
			this.finish(this.player_name1);
		}
		else if (p2Score > this.def.MAXSCORE) {
			this.finish(this.player_name2);
		} else {
			this.scoresDisplay.innerHTML = `${this.player_name1}: ${p1Score} - ${this.player_name2}: ${p2Score}`;
			this.ballStartSide = 1 - this.ballStartSide;
			this.ball = new Ball(this.def, this.ballStartSide, this.context);
			this.ballRespawned = true;
			new Promise(r => setTimeout(r, 300))
				.then(_ => this.ballRespawned = false);
		}
	}

	detectCollision(paddle, ball) {
		let paddleCenter = paddle.getCenter();
		let dx = Math.abs(ball.x - paddleCenter.x);
		let dy = Math.abs(ball.y - paddleCenter.y);
		if (dx <= ball.radius + paddle.width / 2 &&
			dy <= ball.radius + paddle.height / 2)
				return true;
		return false;
	}

	calculateBallVelocity(paddleCenterY, ball, side = 1) {
		let relativeIntersectY = paddleCenterY - ball.y;
		let normRelIntersectY = relativeIntersectY / this.def.PADDLEHEIGHT / 2;
		let bounceAngle = normRelIntersectY * this.def.MAXBOUNCEANGLE;

		ball.speed += ball.speed >= this.def.BALLMAXSPEED ? 0 : this.def.BALLSPEEDINCR;
		ball.vx = ball.speed * side * Math.cos(bounceAngle);
		ball.vy = ball.speed * -Math.sin(bounceAngle);
	}

	keyUpHandler(ev) {
		let attributes = ev.target.attributes;

		let key = ev.key === undefined ? `${attributes.direction.value}${attributes.user_id.value}` : ev.key;

		const idx = this.keys.indexOf(key);
		if (idx != -1)
			this.keys.splice(idx, 1);
	}

	keyDownHandler(ev) {
		let attributes = ev.target.attributes;

		let key = ev.key === undefined ? `${attributes.direction.value}${attributes.user_id.value}` : ev.key;

		if (!this.keys.includes(key))
			this.keys.push(key);
	}

	setNormalAttribute()
	{
		const numComponents = 3;
		const type = this.context.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffers.normal);
		this.context.vertexAttribPointer(
			this.shader_prog.attribLocations.vertexNormal,
			numComponents,
			type,
			normalize,
			stride,
			offset,
		);
		this.context.enableVertexAttribArray(this.shader_prog.attribLocations.vertexNormal);
	}

	setPositionAttribute()
	{
		const numComponents = 3;
		const type = this.context.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.buffers.vertex);
		this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.buffers.index);
		this.context.vertexAttribPointer(
			this.shader_prog.attribLocations.vertexPosition,
			numComponents,
			type,
			normalize,
			stride,
			offset
		);
		this.context.enableVertexAttribArray(this.shader_prog.attribLocations.vertexPosition);
	}
}

class Paddle {
	constructor(paddleSide, def) {
		this.width = def.PADDLEWIDTH;
		this.height = def.PADDLEHEIGHT;
		this.x = paddleSide;
		this.y = def.CANVASHEIGHT / 2 - this.height / 2;
		this.def = def;
		this.update();
	}

	update(ctx, shader_infos) {
		if(ctx instanceof CanvasRenderingContext2D)
		{
			ctx.fillStyle = 'black';
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		else if(ctx instanceof WebGLRenderingContext)
		{
			const posx = (this.x - this.def.CANVASWIDTH / 2);
			const posy = (this.y - this.def.CANVASHEIGHT / 3);
			if(shader_infos !== undefined)
				renderCube(ctx, shader_infos, posx, 0, posy, 0, this.width, this.width, this.height / 2);
		}
	}

	getCenter() {
		return {
			x: this.x + this.width / 2,
			y: this.y + this.height / 2
		};
	}
}

class Ball {
	constructor(def, startSide, ctx) {
		this.radius = def.BALLRADIUS;
		this.speed = def.BALLSPEED;
		this.x = def.CANVASWIDTH / 2;
		this.y = def.CANVASHEIGHT / 2;
		this.vy = 0;
		if (startSide === 0)
			this.vx = -this.speed;
		else
			this.vx = this.speed;
		this.def = def;
		this.update(ctx);
	}

	update(ctx, shader_infos) {
		if(ctx instanceof CanvasRenderingContext2D)
		{
			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
			ctx.fill();
		}
		else if(ctx instanceof WebGLRenderingContext)
		{
			const size = this.radius;
			const posx = (this.x - this.radius / 2) - this.def.CANVASWIDTH / 2;
			const posy = (this.y - this.radius / 2) - this.def.CANVASHEIGHT / 2;
			if(shader_infos !== undefined)
				renderCube(ctx, shader_infos, posx, 0, posy, 0, size, size, size);
		}
	}
}
