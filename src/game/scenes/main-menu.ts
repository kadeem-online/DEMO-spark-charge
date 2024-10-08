import { Scene } from "phaser";

// Rex Components
import Button from "phaser3-rex-plugins/plugins/button";

// Utilities
import { COLORS, SCENES } from "../utils/config";
import { InfoScenPayload } from "../utils/definitions";
import { getLocalScore } from "../utils/functions";

export default class MainMenuScene extends Scene {
	FLAG_can_change_scene: boolean;

	constructor() {
		super(SCENES.mainmenu);
		this.FLAG_can_change_scene = true;
	}

	create() {
		// Events
		this.events.on("ready", this.EVENT_on_ready, this);
		this.events.on("wake", this.EVENT_on_wake, this);

		// Background
		this.SETUP_background_image();

		// Highscore
		this.SETUP_show_current_highscore();

		// action buttons
		this.SETUP_play_action_button();
		this.SETUP_info_action_button();
		this.SETUP_fullscreen_toggle_button();
	}

	ACTION_launch_info_scene() {
		if (this.FLAG_can_change_scene) {
			const data: InfoScenPayload = {
				trigger: this.scene.key,
			};

			this.scene.sleep(this.scene.key);
			this.scene.run(SCENES.info, data);
		}
		this.FLAG_can_change_scene = false;
	}

	ACTION_launch_stage_scene() {
		if (!this.FLAG_can_change_scene) {
			return;
		}
		this.FLAG_can_change_scene = false;

		this.scene.transition({
			target: SCENES.stage,
			duration: 3500,
			moveAbove: true,
		});
		// this.scene.start(SCENES.stage);
	}

	EVENT_on_ready() {
		// console.log("Main Menu Ready");
		this.FLAG_can_change_scene = true;
	}

	EVENT_on_wake() {
		// console.log("Scene Resumed");
		this.FLAG_can_change_scene = true;
	}

	SETUP_background_image() {
		this.add.image(
			Number(this.game.config.width) / 2,
			Number(this.game.config.height) / 2,
			"menu-background"
		);
	}

	SETUP_info_action_button() {
		const center_x = 300;
		const center_y = 810;
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
				this.ACTION_launch_info_scene();
			},
			this
		);
	}

	SETUP_play_action_button() {
		const center_x = 300;
		const center_y = 710;
		const button_height = 80;
		const button_width = 350;
		const button_text = `Play`;

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
				this.ACTION_launch_stage_scene();
			},
			this
		);
	}

	SETUP_show_current_highscore() {
		const score = getLocalScore();
		if (!score) {
			return;
		}

		const high_score_label = this.add.text(300, 380, "HIGHSCORE", {
			color: COLORS.azure[50].css,
			fontFamily: "Departure Mono",
			fontSize: "32px",
			fontStyle: "bold",
			stroke: COLORS.azure[800].css,
			strokeThickness: 5,
		});
		high_score_label.setOrigin(0.5);

		const score_label = this.add.text(300, 450, `${score}`, {
			color: COLORS.gold[400].css,
			fontFamily: "Departure Mono",
			fontSize: "96px",
			fontStyle: "bold",
			stroke: COLORS.gold[800].css,
			strokeThickness: 8,
		});
		score_label.setOrigin(0.5);
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
