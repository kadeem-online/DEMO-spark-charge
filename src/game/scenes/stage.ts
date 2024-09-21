import { Scene, GameObjects, Math as P3Math, Physics, Geom } from "phaser";

// Rex components
import Button from "phaser3-rex-plugins/plugins/button";

// Utilities
import StageOverlayScene from "./stage-overlay";
import GameOverScene from "./gameover";
import { COLORS, QUOTES, SCENES } from "../utils/config";
import {
	GameState,
	PlayerDirection,
	StageScenePayload,
} from "../utils/definitions";
import TouchZone from "../components/touch-zone";

const LANES = {
	1: 132,
	2: 244,
	3: 356,
	4: 468,
};

export default class StageScene extends Scene {
	OBJ_player?: Physics.Arcade.Image;
	TS_road?: GameObjects.TileSprite;
	TEXT_pregame_quote?: GameObjects.Text;
	VAR_obstacle_speed: number;
	VAR_player_direction: PlayerDirection;
	VAR_player_energy: number;
	CTRL_keyboard: { [key: string]: Phaser.Input.Keyboard.Key };
	CTRL_touch_zones?: { left: TouchZone; right: TouchZone };
	state: GameState;

	constructor() {
		super(SCENES.stage);

		this.state = "PREGAME";
		this.CTRL_keyboard = {};
		this.VAR_obstacle_speed = 0.5;
		this.VAR_player_direction = {
			left: false,
			right: false,
		};
		this.VAR_player_energy = 100;
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

		// controls
		this.SETUP_player_keyboard_controls();
		this.SETUP_player_touch_inputs();
	}

	update(_time: number, _delta: number) {
		// scroll road texture
		if (this.state !== "GAMEOVER" && this.TS_road) {
			let new_y = this.TS_road.tilePositionY - this.VAR_obstacle_speed * _delta;
			this.TS_road.setTilePosition(this.TS_road.tilePositionX, new_y);
			// console.log(_delta);
		}

		if (this.state === "RUNNING") {
			this.UPDATE_player_direction();
			this.UPDATE_player_position_and_rotation(_delta);

			this.UPDATE_player_energy(_delta);
		}

		this.UPDATE_miscellaneous_key_presses();
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
		// pause functionality
		this.SETUP_game_pause_button();
	}

	/*##########################################################################*/
	// CREATE
	/*##########################################################################*/

	CREATE_player_car() {
		let lane = LANES[2];

		this.OBJ_player = this.physics.add.image(
			lane,
			700,
			"cq-atlas",
			"car_player"
		);

		if (this.OBJ_player.body instanceof Phaser.Physics.Arcade.Body) {
			this.OBJ_player.body.setBoundsRectangle(
				new Geom.Rectangle(50, 0, 500, Number(this.game.config.height))
			);
		}

		// this.OBJ_player.setCollideWorldBounds(true);
	}

	CREATE_scene_background() {
		this.TS_road = this.add.tileSprite(
			Number(this.game.config.width) / 2,
			Number(this.game.config.height) / 2,
			Number(this.game.config.width),
			Number(this.game.config.height),
			"cq-atlas",
			"road"
		);
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
		// console.log("STAGE: start event");
		this.state = "PREGAME";
		this.VAR_player_energy = 100;
	}

	EVENT_on_transition_start(_scene: Scene, duration: number) {
		this.ACTION_run_pregame_quote(duration);

		this.CREATE_player_car();

		if (this.OBJ_player) {
			const start_y = Number(this.game.config.height) + this.OBJ_player.height;
			const final_y = this.OBJ_player.y;
			this.tweens.add({
				targets: this.OBJ_player,
				y: [start_y, final_y],
				duration: duration,
				ease: "Power1",
			});
		}
	}

	EVENT_on_transition_complete() {
		// console.log("STAGE: transition complete");
		this.ACTION_start_game();
		this.scene.moveAbove(this.scene.key, SCENES.stage_overlay);
		this.scene.run(SCENES.stage_overlay);
		this.state = "RUNNING";

		this.OBJ_player?.setCollideWorldBounds(true);
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

	SETUP_player_touch_inputs() {
		this.CTRL_touch_zones = {
			left: new TouchZone(this, 150, 450, 280, 880),
			right: new TouchZone(this, 450, 450, 280, 880),
		};
	}

	SETUP_player_keyboard_controls() {
		if (!this.input.keyboard) {
			return;
		}

		this.CTRL_keyboard.a = this.input.keyboard.addKey("A");
		this.CTRL_keyboard.d = this.input.keyboard.addKey("D");
		this.CTRL_keyboard.left = this.input.keyboard.addKey("LEFT");
		this.CTRL_keyboard.right = this.input.keyboard.addKey("RIGHT");
		this.CTRL_keyboard.esc = this.input.keyboard.addKey("ESC");

		return;
	}

	/*##########################################################################*/
	// UPDATE
	/*##########################################################################*/

	/**
	 * Checks for the registered inputs and updates the player direction accordingly.
	 */
	UPDATE_player_direction() {
		this.VAR_player_direction.left =
			this.CTRL_keyboard.a?.isDown ||
			this.CTRL_keyboard.left?.isDown ||
			this.CTRL_touch_zones?.left?.isDown ||
			false;

		this.VAR_player_direction.right =
			this.CTRL_keyboard.d?.isDown ||
			this.CTRL_keyboard.right?.isDown ||
			this.CTRL_touch_zones?.right?.isDown ||
			false;
	}

	UPDATE_player_energy(delta: number) {
		const tick_speed = 100 / 20000; // 20000ms for the full bar to drain

		this.VAR_player_energy -= tick_speed * delta;

		this.events.emit("updateEnergy", this.VAR_player_energy);

		if (this.VAR_player_energy <= 0) {
			this.ACTION_end_game();
		}
	}

	UPDATE_player_position_and_rotation(delta: number) {
		if (!this.OBJ_player) {
			return;
		}

		const move_speed = 0.3;
		const angle = 5;

		if (
			(this.VAR_player_direction.left && this.VAR_player_direction.right) ||
			(!this.VAR_player_direction.left && !this.VAR_player_direction.right)
		) {
			this.OBJ_player.setAngle(0);
		} else if (this.VAR_player_direction.left) {
			this.OBJ_player.setAngle(-angle);
			this.OBJ_player.x -= move_speed * delta;
		} else if (this.VAR_player_direction.right) {
			this.OBJ_player.setAngle(angle);
			this.OBJ_player.x += move_speed * delta;
		}
	}

	/**
	 * Checks for miscellaneous key presses
	 */
	UPDATE_miscellaneous_key_presses() {
		if (this.state === "RUNNING") {
			if (this.CTRL_keyboard.esc?.isDown) {
				this.ACTION_pause_game();
				return;
			}
		}
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
