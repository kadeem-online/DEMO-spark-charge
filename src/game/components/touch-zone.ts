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
	}

	EVENT_pointerdown() {
		this.state = this.STATES.down;
		this.isDown = true;

		this.on("pointerup", this.EVENT_pointerup, this);
		this.on("pointerout", this.EVENT_pointerup, this);
	}

	EVENT_pointerup() {
		this.state = this.STATES.up;
		this.isDown = false;

		this.off("pointerup", this.EVENT_pointerup, this);
		this.off("pointerout", this.EVENT_pointerup, this);
	}
}
