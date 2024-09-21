import { Scene } from "phaser";

// Utilities
import { COLORS, SCENES } from "../utils/config";

export default class PreloadScene extends Scene {
	constructor() {
		super(SCENES.preload);
	}

	init() {
		//  We loaded this image in our Boot Scene, so we can display it here
		this.add.image(300, 425, "company-logo");

		// set background color for preload scene
		this.cameras.main.setBackgroundColor(COLORS.azure[900].hex);

		//  A simple progress bar. This is the outline of the bar.
		const border_x = 300;
		const border_y = 605;
		const border_width = 500;
		const border_height = 40;
		this.add
			.rectangle(border_x, border_y, border_width, border_height)
			.setStrokeStyle(2, COLORS.gray[50].hex);

		//  This is the progress bar itself. It will increase in size from the left based on the % of progress.
		const bar_padding = 8;
		const bar_min_width = 4;
		const bar_max_width = border_width - bar_padding * 2;
		const bar_height = border_height - bar_padding * 2;
		const bar_width_allowance = bar_max_width - bar_min_width;

		const bar = this.add.rectangle(
			border_x - bar_width_allowance / 2,
			border_y,
			bar_min_width,
			bar_height,
			COLORS.gray[50].hex
		);

		//  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
		this.load.on("progress", (progress: number) => {
			bar.width = bar_min_width + bar_width_allowance * progress;
		});
	}

	preload() {
		//  Load the assets for the game - Replace with your own assets
		this.load.setPath("assets");

		// main menu background
		this.load.image("menu-background", "menu-background.jpg");
	}

	create() {
		//  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
		//  For example, you can define global animations here, so we can use them in other scenes.
		//  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.

		// Immediately move to the next scene on load complete.
		// this.time.delayedCall(1000, this.nextScene, [], this);
		this.nextScene();
	}

	nextScene() {
		// this.scene.start(SCENES.mainmenu);
		this.scene.transition({
			target: SCENES.stage,
		});
	}
}
