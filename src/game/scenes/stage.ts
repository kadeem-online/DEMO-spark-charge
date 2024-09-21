import { Scene, GameObjects, Math as P3Math, Physics } from "phaser";

// Rex components
import Button from "phaser3-rex-plugins/plugins/button";

// Utilities
import StageOverlayScene from "./stage-overlay";
import GameOverScene from "./gameover";
import { COLORS, QUOTES, SCENES } from "../utils/config";
import { GameState, StageScenePayload } from "../utils/definitions";

export default class StageScene extends Scene {
	TEXT_pregame_quote?: GameObjects.Text;
	state: GameState;

	constructor() {
		super(SCENES.stage);
		this.state = "PREGAME";
	}

	init() {
		this.SETUP_initialize_stage_overlay();
		this.events.on("transitionstart", this.EVENT_on_transition_start, this);
		this.events.on(
			"transitioncomplete",
			this.EVENT_on_transition_complete,
			this
		);
	}

	create() {
		// events
		this.events.on("resume", this.EVENT_on_resume, this);
		this.events.on("shutdown", this.EVENT_on_shutdown, this);
		this.events.on("start", this.EVENT_on_start, this);

		// background
		this.CREATE_scene_background();
	}

	/*##########################################################################*/
	// ACTION
	/*##########################################################################*/

	ACTION_end_game() {
		if (this.state === "RUNNING") {
			this.scene.add(SCENES.gameover, GameOverScene, true);
			this.scene.moveAbove(this.scene.key, SCENES.gameover);

			this.scene.pause(this.scene.key);
			this.scene.sleep(SCENES.stage_overlay);

			this.state = "GAMEOVER";
		}
	}

	ACTION_pause_game() {
		this.scene.pause(this.scene.key);
		this.scene.sleep(SCENES.stage_overlay);
		this.scene.run(SCENES.pause);
	}

	ACTION_run_pregame_quote(duration: number) {
		const random_quote_index = P3Math.Between(0, QUOTES.length - 1);
		const random_quote = QUOTES[random_quote_index];

		this.TEXT_pregame_quote = this.add
			.text(
				Number(this.game.config.width) / 2,
				Number(this.game.config.height) / 2,
				random_quote,
				{
					align: "center",
					color: COLORS.azure[100].css,
					fontFamily: "Departure Mono",
					fontSize: "24px",
					wordWrap: {
						width: 400,
					},
				}
			)
			.setOrigin(0.5);

		const total_duration = duration * 0.9;
		const on_screen_duration = total_duration / 2;
		const fade_away_duration = total_duration / 2;

		this.tweens.add({
			targets: this.TEXT_pregame_quote,
			alpha: {
				from: 1,
				to: 0,
			},
			delay: on_screen_duration,
			duration: fade_away_duration,
		});
	}

	ACTION_start_game() {
		// temporary game representaion.
		this.TEMP_game_state_representation();
		this.TEMP_game_over_button();

		// pause functionality
		this.SETUP_game_pause_button();
	}

	/*##########################################################################*/
	// CREATE
	/*##########################################################################*/

	CREATE_scene_background() {
		this.cameras.main.setBackgroundColor(COLORS.azure[900].hex);
	}

	/*##########################################################################*/
	// EVENTS
	/*##########################################################################*/

	EVENT_on_resume(_sys: Phaser.Scenes.Systems, _data: StageScenePayload) {
		this.scene.wake(SCENES.stage_overlay);
	}

	EVENT_on_shutdown() {
		this.scene.stop(SCENES.stage_overlay);
	}

	EVENT_on_start() {
		console.log("STAGE: start event");
	}

	EVENT_on_transition_start(_scene: Scene, duration: number) {
		this.ACTION_run_pregame_quote(duration);
	}

	EVENT_on_transition_complete() {
		// console.log("STAGE: transition complete");
		this.ACTION_start_game();
		this.scene.moveAbove(this.scene.key, SCENES.stage_overlay);
		this.scene.run(SCENES.stage_overlay);
		this.state = "RUNNING";
	}

	/*##########################################################################*/
	// SETUP
	/*##########################################################################*/

	SETUP_initialize_stage_overlay() {
		if (this.scene.get(SCENES.stage_overlay) === null) {
			this.scene.add(SCENES.stage_overlay, StageOverlayScene, false);
			this.scene.moveAbove(this.scene.key, SCENES.stage_overlay);
		}
	}

	SETUP_game_pause_button() {
		const center_x = 538;
		const center_y = 62;
		const button_height = 64;
		const button_width = 64;

		const background = this.add.rectangle(
			center_x,
			center_y,
			button_width,
			button_height,
			COLORS.gold[500].hex,
			0.9
		);

		const button = new Button(background, {
			mode: "pointerup",
			threshold: 300,
			clickInterval: 200,
		});

		button.on(
			"click",
			() => {
				this.ACTION_pause_game();
			},
			this
		);
	}

	/*##########################################################################*/
	// TEMPORARY | DEBUG
	/*##########################################################################*/

	TEMP_game_state_representation() {
		const ball = this.add.circle(
			Number(this.game.config.width) / 2,
			Number(this.game.config.height) / 2,
			20,
			COLORS.gold[500].hex
		);

		this.physics.world.enableBody(ball, Physics.Arcade.DYNAMIC_BODY);

		if (ball.body && ball.body instanceof Physics.Arcade.Body) {
			ball.body.setBounce(1);
			ball.body.setCollideWorldBounds(true);

			const launch_magnitude = P3Math.Between(200, 400);
			const launch_angle = P3Math.Between(0, 359);
			const launch_radians = P3Math.DegToRad(launch_angle);
			ball.body.setVelocity(
				launch_magnitude * Math.cos(launch_radians),
				launch_magnitude * Math.sin(launch_radians)
			);
		}
	}

	TEMP_game_over_button() {
		const center_x = 300;
		const center_y = 450;
		const button_height = 64;
		const button_width = 64;

		const background = this.add.rectangle(
			center_x,
			center_y,
			button_width,
			button_height,
			0xff0000,
			0.9
		);

		const button = new Button(background, {
			mode: "pointerup",
			threshold: 300,
			clickInterval: 200,
		});

		button.on(
			"click",
			() => {
				this.ACTION_end_game();
			},
			this
		);
	}
}
