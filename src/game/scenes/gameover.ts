import { Scene } from "phaser";

// rex components
import Button from "phaser3-rex-plugins/plugins/button";

// utils
import { SCENES, COLORS } from "../utils/config";

export default class GameOverScene extends Scene {
	constructor() {
		super(SCENES.gameover);
	}

	create() {
		// buttons
		this.SETUP_main_menu_button();
		this.SETUP_restart_game_button();
	}

	ACTION_exit_to_main_menu() {
		this.scene.stop(SCENES.stage);
		this.scene.stop(SCENES.pause);
		this.scene.run(SCENES.mainmenu);
		this.scene.remove(this.scene.key);
	}

	ACTION_restart_game() {
		this.scene.stop(SCENES.stage);
		this.scene.stop(SCENES.stage_overlay);
		this.scene.transition({
			target: SCENES.stage,
			remove: true,
			duration: 1000,
			moveAbove: true,
		});
	}

	SETUP_restart_game_button() {
		const center_x = 300;
		const center_y = 710;
		const button_height = 80;
		const button_width = 350;
		const button_text = `Restart`;

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
				this.ACTION_restart_game();
			},
			this
		);
	}

	SETUP_main_menu_button() {
		const center_x = 300;
		const center_y = 810;
		const button_height = 80;
		const button_width = 350;
		const button_text = `Main Menu`;

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
				this.ACTION_exit_to_main_menu();
			},
			this
		);
	}
}
