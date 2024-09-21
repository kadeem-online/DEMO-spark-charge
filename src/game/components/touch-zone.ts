import { GameObjects } from "phaser";

export default class TouchZone extends GameObjects.Zone {
	isDown: boolean = false;
	STATES = {
		up: "RELEASED",
		down: "PRESSED",
	};

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		width: number,
		height: number
	) {
		super(scene, x, y, width, height);

		this.scene.add.existing(this);
		this.state = this.STATES.up;

		this.setInteractive();
		this.on("pointerdown", this.EVENT_pointerdown, this);
		this.on("pointerup", this.EVENT_pointerup, this);
	}

	EVENT_pointerdown() {
		this.state = this.STATES.down;
		this.isDown = true;
	}

	EVENT_pointerup() {
		this.state = this.STATES.up;
		this.isDown = false;
	}
}
