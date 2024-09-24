import { Physics } from "phaser";

type TokenTypesBlueprint = "hydro" | "solar" | "wind" | null;

export default class Token extends Physics.Arcade.Image {
	FLAG_canPassEnergy: boolean = false;
	energy: number = 0;
	movementTween?: Phaser.Tweens.Tween;
	private tokenEffect: TokenTypesBlueprint = null;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: string,
		frame: string
	) {
		super(scene, x, y, texture, frame);
		this.scene.add.existing(this);
		this.scene.physics.world.enableBody(this, Physics.Arcade.DYNAMIC_BODY);
		if (this.body instanceof Phaser.Physics.Arcade.Body) {
			this.setCircle(22, -2, -2);
		}
	}

	setEffect(type: "hydro" | "solar" | "wind") {
		this.tokenEffect = type;
	}

	getEffect() {
		return this.tokenEffect;
	}

	setMovementTween(tween: Phaser.Tweens.Tween) {
		this.clearMovementTween();
		this.movementTween = tween;
	}

	clearMovementTween() {
		this.movementTween?.stop();
	}

	assignMovementPattern(pattern: "zigzag" | "wave" | "straight") {
		let displacement = 0;
		switch (pattern) {
			case "zigzag":
				displacement = 400;
				// this.x -= displacement / 2;
				this.setMovementTween(
					this.scene.tweens.add({
						targets: this,
						x: {
							value: `+=${displacement}`,
							duration: 1600,
							ease: "Sine.easeInOut",
						},
						repeat: -1,
						yoyo: true,
					})
				);
				break;
			case "wave":
				displacement = 50;
				this.x -= displacement / 2;
				this.setMovementTween(
					this.scene.tweens.add({
						targets: this,
						x: {
							value: `+=${displacement}`,
							duration: 700,
							ease: "Linear",
						},
						repeat: -1,
						yoyo: true,
					})
				);
				break;
			case "straight":
				this.clearMovementTween();
				break;
		}
	}
}
