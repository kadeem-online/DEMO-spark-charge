import { Scene } from "phaser";

// Utilities
import { SCENES } from "../utils/config";

export default class BootScene extends Scene {
	constructor() {
		super(SCENES.boot);
	}

	preload() {
		this.load.image("company-logo", "/assets/company-logo.png");
	}

	create() {
		this.nextScene();
	}

	nextScene() {
		this.scene.start(SCENES.preload);
	}
}
