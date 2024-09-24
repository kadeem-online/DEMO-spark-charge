import { Scene, GameObjects, Math as P3Math, Physics, Geom } from "phaser";

// Rex components
import Button from "phaser3-rex-plugins/plugins/button";

// Utilities
import StageOverlayScene from "./stage-overlay";
import GameOverScene from "./gameover";
import { COLORS, QUOTES, SCENES } from "../utils/config";
import {
	GameLevelBlueprint,
	GameState,
	PlayerDirection,
	StageScenePayload,
	TokenOptions,
} from "../utils/definitions";
import TouchZone from "../components/touch-zone";
import Lane from "../components/lane";
import Token from "../components/token";
import { CreateGameLevels } from "../utils/functions";

const LANES = {
	1: new Lane(132),
	2: new Lane(244),
	3: new Lane(356),
	4: new Lane(468),
};

export default class StageScene extends Scene {
	OBJ_player?: Physics.Arcade.Image;
	TS_road?: GameObjects.TileSprite;
	TEXT_pregame_quote?: GameObjects.Text;
	VAR_player_direction: PlayerDirection;
	VAR_player_energy: number;
	VAR_start_level = 0;
	VAR_end_level = 20;
	VAR_current_level: number = 0;
	VAR_level_data: GameLevelBlueprint = CreateGameLevels(0);
	CTRL_keyboard: { [key: string]: Phaser.Input.Keyboard.Key };
	CTRL_touch_zones?: { left: TouchZone; right: TouchZone };
	POOL_traffic?: Phaser.Physics.Arcade.Group;
	POOL_token?: Phaser.Physics.Arcade.Group;
	AUDIO_bgm?:
		| Phaser.Sound.HTML5AudioSound
		| Phaser.Sound.NoAudioSound
		| Phaser.Sound.WebAudioSound;
	state: GameState;

	VAR_traffic_keys = [
		"car_1",
		"car_2",
		"car_3",
		"car_4",
		"car_5",
		"truck",
		"truck_loaded",
	];

	constructor() {
		super(SCENES.stage);

		this.state = "PREGAME";
		this.CTRL_keyboard = {};
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

		this.AUDIO_bgm = this.sound.add("stage-bgm", { volume: 0.1, loop: true });

		// controls
		this.SETUP_player_keyboard_controls();
		this.SETUP_player_touch_inputs();
	}

	update(_time: number, _delta: number) {
		// scroll road texture
		if (this.state !== "GAMEOVER" && this.TS_road) {
			let new_y =
				this.TS_road.tilePositionY -
				this.VAR_level_data.road_scroll_speed * _delta;
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

			this.AUDIO_bgm?.stop();

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
		let lane = LANES[2].x;

		this.OBJ_player = this.physics.add.image(
			lane,
			750,
			"cq-atlas",
			"car_player"
		);

		if (this.OBJ_player.body instanceof Phaser.Physics.Arcade.Body) {
			this.OBJ_player.body.setBoundsRectangle(
				new Geom.Rectangle(50, 0, 500, Number(this.game.config.height))
			);
			this.OBJ_player.body.setSize(
				this.OBJ_player.width - 12,
				this.OBJ_player.height - 20,
				true
			);
		}

		this.OBJ_player.setPushable(false);

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

	CREATE_token_pool() {
		this.POOL_token = this.physics.add.group({
			classType: Token,
			max: 20,
			quantity: 2,
			active: false,
			visible: false,
			key: "cq-atlas",
			frame: ["wind", "hydro", "solar"],
			randomFrame: true,
		});

		this.POOL_token.setDepth(5);
	}

	CREATE_traffic_vehicle_pool() {
		this.POOL_traffic = this.physics.add.group({
			key: "cq-atlas",
			classType: Phaser.Physics.Arcade.Image,
			frame: this.VAR_traffic_keys,
			randomFrame: true,
			active: false,
			quantity: 1,
			visible: false,
			max: 10,
			// runChildUpdate: true,
		});

		this.POOL_traffic.setDepth(10);
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

		// RESETS
		this.VAR_current_level = 0;
		this.VAR_level_data = CreateGameLevels(this.VAR_current_level);
		this.CREATE_token_pool();
		this.CREATE_traffic_vehicle_pool();
	}

	EVENT_on_transition_complete() {
		// console.log("STAGE: transition complete");
		this.ACTION_start_game();
		this.scene.moveAbove(this.scene.key, SCENES.stage_overlay);
		this.scene.run(SCENES.stage_overlay);
		this.state = "RUNNING";

		this.OBJ_player?.setCollideWorldBounds(true);

		// setup player collisions
		if (this.OBJ_player) {
			if (this.POOL_traffic) {
				this.physics.add.collider(
					this.POOL_traffic,
					this.OBJ_player,
					() => {
						this.ACTION_end_game();
					},
					undefined,
					this
				);
			}

			if (this.POOL_token) {
				this.physics.add.overlap(
					this.POOL_token,
					this.OBJ_player,
					(object1, object2) => {
						const token =
							object1 instanceof Token
								? object1
								: object2 instanceof Token
								? object2
								: null;
						if (token) {
							this.UTIL_collect_token(token);
						}
					},
					undefined,
					this
				);
			}
		}

		this.AUDIO_bgm?.play();
		this.UTIL_vehicle_spawn_timer();
		this.UTIL_token_spawn_timer();
		this.UTIL_level_increment_timer();
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
		const pause = this.add.image(center_x, center_y, "cq-atlas", "pause");

		const button = new Button(pause, {
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

	SETUP_game_levels() {}

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
	// UTILITY functions
	/*##########################################################################*/

	UTIL_vehicle_spawn_timer() {
		const min_wait = this.VAR_level_data.vehicle_timer.min;
		const max_wait = this.VAR_level_data.vehicle_timer.max;

		const wait = Phaser.Math.Between(min_wait, max_wait);

		this.UTIL_spawn_vehicle();
		this.UTIL_despawn_vehicles(1000);
		// this.DEBUG_log_vehicle_pool_stats();

		this.time.delayedCall(wait, this.UTIL_vehicle_spawn_timer, [], this);
	}

	UTIL_token_spawn_timer() {
		const min_wait = this.VAR_level_data.token_timer.min;
		const max_wait = this.VAR_level_data.token_timer.max;

		const wait = Phaser.Math.Between(min_wait, max_wait);

		this.UTIL_spawn_token();
		this.UTIL_despawn_token(800);
		// this.DEBUG_log_token_pool_stats();

		this.time.delayedCall(wait, this.UTIL_token_spawn_timer, [], this);
	}

	UTIL_token_spawn_poll(): TokenOptions {
		const token_frames =
			this.VAR_player_energy > 90
				? ["hydro"]
				: this.VAR_player_energy > 60
				? ["hydro", "solar"]
				: this.VAR_player_energy > 30
				? ["solar", "wind"]
				: ["wind"];

		const frame_index = Phaser.Math.Between(0, token_frames.length - 1);
		const frame = (token_frames[frame_index] as TokenOptions) || "hydro";

		return frame;
	}

	UTIL_spawn_token() {
		if (!this.POOL_token) {
			return;
		}

		const spawn_y = -600;

		try {
			const token: Token = this.POOL_token.get();

			if (!token) {
				return;
			}

			const frame = this.UTIL_token_spawn_poll();

			const spawn_lane = (Math.floor(Math.random() * 4) + 1) as 1 | 2 | 3 | 4;
			let spawn_x = LANES[spawn_lane].x;

			switch (frame) {
				case "hydro":
					token.energy = 10;
					token.clearMovementTween();
					break;
				case "solar":
					token.energy = 20;
					token.assignMovementPattern("wave");
					spawn_x -= 25;
					break;
				case "wind":
					token.energy = 40;
					token.assignMovementPattern("zigzag");
					spawn_x = 100;
					break;
			}

			token.setTexture("cq-atlas", frame);

			token.setPosition(spawn_x, spawn_y);
			token.setActive(true);
			token.setVisible(true);
			token.FLAG_canPassEnergy = true;
			// token.setVelocityY(this.VAR_obstacle_speed * multiplier);
			token.setVelocityY(this.VAR_level_data.token_speed);
		} catch (error) {}
	}

	UTIL_spawn_vehicle() {
		if (!this.POOL_traffic) {
			return;
		}

		const spawn_y = -600;
		const spawn_lane = (Math.floor(Math.random() * 4) + 1) as 1 | 2 | 3 | 4;
		const spawn_x = LANES[spawn_lane].x;

		try {
			const vehicle: Phaser.Physics.Arcade.Image = this.POOL_traffic.get();

			const frame_index = Phaser.Math.Between(
				0,
				this.VAR_traffic_keys.length - 1
			);
			const frame = this.VAR_traffic_keys[frame_index];

			vehicle.setTexture("cq-atlas", frame);
			vehicle.body?.setSize(
				vehicle.width * this.VAR_level_data.vehicle_hitbox_scale.width,
				vehicle.height * this.VAR_level_data.vehicle_hitbox_scale.height,
				true
			);

			vehicle.setPosition(spawn_x, spawn_y);
			vehicle.setActive(true);
			vehicle.setVisible(true);
			// vehicle.setVelocityY(this.VAR_obstacle_speed * multiplier);
			vehicle.setVelocityY(this.VAR_level_data.vehicle_speed);
		} catch (error) {}
	}

	UTIL_collect_token(token: Token) {
		try {
			this.POOL_token?.killAndHide(token);

			if (token.FLAG_canPassEnergy) {
				this.VAR_player_energy = Phaser.Math.Clamp(
					this.VAR_player_energy + token.energy,
					0,
					100
				);
				token.FLAG_canPassEnergy = false;
			}
		} catch (error) {}
	}

	UTIL_level_increment_timer() {
		if (this.VAR_current_level >= this.VAR_end_level) {
			return;
		}

		// this.DEBUG_log_level_information();
		const level_duration = 10000;

		let next_level = Phaser.Math.Clamp(
			this.VAR_current_level + 1,
			this.VAR_start_level,
			this.VAR_end_level
		);

		const level_data = CreateGameLevels(next_level / this.VAR_end_level);
		this.VAR_current_level = next_level;

		const fn_nextLevel = () => {
			this.VAR_level_data = level_data;

			if (this.POOL_token) {
				this.POOL_token.children.iterate((entry) => {
					if (entry instanceof Token && entry.active) {
						entry.setVelocityY(this.VAR_level_data.token_speed);
					}
					return null;
				});
			}

			if (this.POOL_traffic) {
				this.POOL_traffic.children.iterate((entry) => {
					if (entry instanceof Phaser.Physics.Arcade.Image && entry.active) {
						entry.setVelocityY(this.VAR_level_data.vehicle_speed);
					}
					return null;
				});
			}
		};

		this.time.delayedCall(
			level_duration,
			() => {
				fn_nextLevel();
				this.UTIL_level_increment_timer();
			},
			[],
			this
		);
	}

	/**
	 * Despawn vehicles that are past the specified y value
	 *
	 * @param y {number} - y value past which vehicles will be despawned.
	 */
	UTIL_despawn_vehicles(y: number) {
		if (!this.POOL_traffic) {
			return;
		}

		this.POOL_traffic.children.each((entry) => {
			const vehicle = entry as Phaser.Physics.Arcade.Image;

			const height = vehicle.height;
			if (vehicle.y > y + height / 2) {
				this.POOL_traffic?.killAndHide(entry);
				vehicle.body?.reset(0, 0);
			}

			return null;
		});
	}

	UTIL_despawn_token(y: number) {
		if (!this.POOL_token) {
			return;
		}

		this.POOL_token.children.each((entry) => {
			const token = entry as Token;

			const height = token.height;
			if (token.y > y + height / 2) {
				this.POOL_token?.killAndHide(entry);
				token.clearMovementTween();
				token.body?.reset(0, 0);
			}

			return null;
		});
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
		const tick_speed =
			this.VAR_player_energy > 10
				? 0.005
				: this.VAR_player_energy > 5
				? 0.0025
				: 0.00125;

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

		const move_speed = 0.4;
		const angle = 4;

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

	DEBUG_log_level_information() {
		let log = `LEVEL INFO`;
		log += `\nLevel: ${this.VAR_current_level}`;
		log += `\nData: ${this.VAR_level_data}`;

		console.log(log);
	}

	DEBUG_log_token_pool_stats() {
		if (this.POOL_token) {
			let log = `Token Pool Statistics:`;
			log += `\ntotal: ${this.POOL_token.getLength()}`;
			log += `\nused: ${this.POOL_token.getTotalUsed()}`;

			console.log(log);
		}
	}

	DEBUG_log_vehicle_pool_stats() {
		if (this.POOL_traffic) {
			let log = `Vehicle Pool Statistics:`;
			log += `\ntotal: ${this.POOL_traffic.getLength()}`;
			log += `\nused: ${this.POOL_traffic.getTotalUsed()}`;

			console.log(log);
		}
	}

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

	TEMP_spawn_recharge_token() {
		const lanes = Object.values(LANES);
		console.log(lanes);

		// const group = this.physics.add.group();

		this.add.image(300, 450, "cq-atlas", "wind");
	}
}
