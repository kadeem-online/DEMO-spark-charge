import { Scene } from "phaser";

// Rex components
import Button from "phaser3-rex-plugins/plugins/button";

// Utilities
import { COLORS, SCENES } from "../utils/config";
import { InfoScenPayload } from "../utils/definitions";

export default class PauseScene extends Scene {
	FLAG_can_take_action: boolean;

	constructor() {
		super(SCENES.pause);
		this.FLAG_can_take_action = true;
	}

	init() {}

	create() {
		// events
		this.events.on("shutdown", this.EVENT_on_shutdown, this);
		this.events.on("sleep", this.EVENT_on_sleep, this);
		this.events.on("start", this.EVENT_on_shutdown, this);
		this.events.on("wake", this.EVENT_on_wake, this);

		// on first run
		this.scene.moveAbove(SCENES.stage, this.scene.key);

		// background
		this.CREATE_background_overlay();

		// action controls
		this.SETUP_resume_game_button();
		this.SETUP_quit_to_menu_button();
		this.SETUP_view_info_scene_button();
		this.SETUP_fullscreen_toggle_button();
	}

	ACTION_resume_game() {
		if (!this.FLAG_can_take_action) {
			return;
		}
		this.FLAG_can_take_action = false;

		this.scene.sleep(this.scene.key);
		this.scene.resume(SCENES.stage);
	}

	ACTION_quit_to_menu() {
		if (!this.FLAG_can_take_action) {
			return;
		}
		this.FLAG_can_take_action = false;

		this.scene.stop(this.scene.key);
		this.scene.stop(SCENES.stage);
		this.scene.run(SCENES.mainmenu);
	}

	ACTION_view_info_scene() {
		if (!this.FLAG_can_take_action) {
			return;
		}
		this.FLAG_can_take_action = false;

		this.scene.sleep(this.scene.key);

		const scenes_to_hide = [SCENES.pause, SCENES.stage];
		scenes_to_hide.forEach((scene) => {
			this.scene.setVisible(false, scene);
		});

		const data: InfoScenPayload = {
			trigger: this.scene.key,
		};
		this.scene.run(SCENES.info, data);
	}

	CREATE_background_overlay() {
		this.add.rectangle(
			Number(this.game.config.width) / 2,
			Number(this.game.config.height) / 2,
			Number(this.game.config.width),
			Number(this.game.config.height),
			COLORS.azure[900].hex,
			0.5
		);
	}

	EVENT_on_shutdown() {
		this.FLAG_can_take_action = true;
	}

	EVENT_on_sleep() {
		this.FLAG_can_take_action = true;
	}

	EVENT_on_start() {
		console.log("PAUSE: start");
	}

	EVENT_on_wake() {
		console.log("PAUSE: wake");

		this.scene.moveAbove(SCENES.stage, this.scene.key);

		const scenes_to_reveal = [SCENES.pause, SCENES.stage];
		scenes_to_reveal.forEach((scene) => {
			this.scene.setVisible(true, scene);
		});
	}

	SETUP_resume_game_button() {
		const center_x = 300;
		const center_y = 610;
		const button_height = 80;
		const button_width = 350;
		const button_text = `Resume`;

		const background = this.add.rectangle(
			center_x,
			center_y,
			button_width,
			button_height,
			COLORS.gray[50].hex,
			0.9
		);
		background.setStrokeStyle(4, COLORS.azure[800].hex);

		const label = this.add.text(center_x, center_y, button_text, {
			fontFamily: "Departure Mono",
			color: COLORS.azure[800].css,
			fontSize: "40px",
			fontStyle: "bold",
		});
		label.setOrigin(0.5);

		const button = new Button(background, {
			mode: "pointerup",
			threshold: 300,
			clickInterval: 200,
		});

		button.on(
			"down",
			() => {
				background.setFillStyle(COLORS.gold[500].hex);
				label.setColor(COLORS.gold[900].css);

				// reverts the visual changes made when the button is pressed.
				const revert = () => {
					background.setFillStyle(COLORS.gray[50].hex, 0.9);
					label.setColor(COLORS.azure[800].css);

					button.off("up", revert);
					button.off("out", revert);
				};

				button.on("up", revert);
				button.on("out", revert);
			},
			this
		);

		button.on(
			"click",
			() => {
				this.ACTION_resume_game();
			},
			this
		);
	}

	SETUP_quit_to_menu_button() {
		const center_x = 300;
		const center_y = 810;
		const button_height = 80;
		const button_width = 350;
		const button_text = `Quit`;

		const background = this.add.rectangle(
			center_x,
			center_y,
			button_width,
			button_height,
			COLORS.gray[50].hex,
			0.9
		);
		background.setStrokeStyle(4, COLORS.azure[800].hex);

		const label = this.add.text(center_x, center_y, button_text, {
			fontFamily: "Departure Mono",
			color: COLORS.azure[800].css,
			fontSize: "40px",
			fontStyle: "bold",
		});
		label.setOrigin(0.5);

		const button = new Button(background, {
			mode: "pointerup",
			threshold: 300,
			clickInterval: 200,
		});

		button.on(
			"down",
			() => {
				background.setFillStyle(COLORS.gold[500].hex);
				label.setColor(COLORS.gold[900].css);

				// reverts the visual changes made when the button is pressed.
				const revert = () => {
					background.setFillStyle(COLORS.gray[50].hex, 0.9);
					label.setColor(COLORS.azure[800].css);

					button.off("up", revert);
					button.off("out", revert);
				};

				button.on("up", revert);
				button.on("out", revert);
			},
			this
		);

		button.on(
			"click",
			() => {
				this.ACTION_quit_to_menu();
			},
			this
		);
	}

	SETUP_view_info_scene_button() {
		const center_x = 300;
		const center_y = 710;
		const button_height = 80;
		const button_width = 350;
		const button_text = `Info`;

		const background = this.add.rectangle(
			center_x,
			center_y,
			button_width,
			button_height,
			COLORS.gray[50].hex,
			0.9
		);
		background.setStrokeStyle(4, COLORS.azure[800].hex);

		const label = this.add.text(center_x, center_y, button_text, {
			fontFamily: "Departure Mono",
			color: COLORS.azure[800].css,
			fontSize: "40px",
			fontStyle: "bold",
		});
		label.setOrigin(0.5);

		const button = new Button(background, {
			mode: "pointerup",
			threshold: 300,
			clickInterval: 200,
		});

		button.on(
			"down",
			() => {
				background.setFillStyle(COLORS.gold[500].hex);
				label.setColor(COLORS.gold[900].css);

				// reverts the visual changes made when the button is pressed.
				const revert = () => {
					background.setFillStyle(COLORS.gray[50].hex, 0.9);
					label.setColor(COLORS.azure[800].css);

					button.off("up", revert);
					button.off("out", revert);
				};

				button.on("up", revert);
				button.on("out", revert);
			},
			this
		);

		button.on(
			"click",
			() => {
				this.ACTION_view_info_scene();
			},
			this
		);
	}

	SETUP_fullscreen_toggle_button() {
		const _texture_key: string = this.scale.isFullscreen
			? "collapse"
			: "expand";

		const button_image = this.add.image(548, 848, "cq-atlas", _texture_key);
		button_image.setAlpha(0.5);

		const toggleFullscreen = () => {
			this.scale.toggleFullscreen();

			const _texture_key: string = this.scale.isFullscreen
				? "expand"
				: "collapse";
			button_image.setFrame(_texture_key);
		};

		const button = new Button(button_image, {
			mode: "pointerup",
			threshold: 300,
			clickInterval: 200,
		});

		button.on("click", toggleFullscreen, this);
	}
}
