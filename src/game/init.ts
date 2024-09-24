import * as Phaser from "phaser";
import { AUTO, Game, Scale, Types } from "phaser";

// Variables
import { COLORS } from "./utils/config";

// Scenes
import BootScene from "./scenes/boot";
import PreloadScene from "./scenes/preload";
import MainMenuScene from "./scenes/main-menu";
import InfoScene from "./scenes/info";
import StageScene from "./scenes/stage";
import PauseScene from "./scenes/pause";

window.Phaser = Phaser;

export default async function startGame(): Promise<Game | void> {
	try {
		await document.fonts.load(`16px "Departure Mono"`);
	} catch (error) {
		console.error("Failed to load font 'Departure Mono':", error);
	}

	try {
		const config: Types.Core.GameConfig = {
			backgroundColor: COLORS.azure[500].hex,
			fullscreenTarget: "charge-race-challenge",
			height: 900,
			input: {
				activePointers: 3,
			},
			parent: "charge-race-challenge",
			physics: {
				arcade: {
					// debug: true,
				},
				default: "arcade",
			},
			scale: {
				mode: Scale.ScaleModes.FIT,
				autoCenter: Scale.CENTER_BOTH,
			},
			scene: [
				BootScene,
				PreloadScene,
				MainMenuScene,
				InfoScene,
				StageScene,
				PauseScene,
			],
			type: AUTO,
			width: 600,
		};
		const game = new Game(config);
		return game;
	} catch (error) {
		console.error("Failed to run 'Spark Charge Challenge':", error);
		return;
	}
}
