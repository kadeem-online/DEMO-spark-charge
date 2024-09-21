import { Scene, GameObjects } from "phaser";

// utils
import { COLORS, SCENES } from "../utils/config";

export default class StageOverlayScene extends Scene {
	VAR_count: number;
	TEXT_count?: GameObjects.Text;

	constructor() {
		super(SCENES.stage_overlay);
		this.VAR_count = 0;
	}

	create() {
		// Events
		this.events.on("shutdown", this.EVENT_on_shutdown, this);

		this.add.rectangle(300, 830, 500, 40, COLORS.gold[300].hex);

		this.TEXT_count = this.add
			.text(
				Number(this.game.config.width) / 2,
				Number(this.game.config.height) / 2,
				"0",
				{
					color: COLORS.gray[50].css,
					fontFamily: "Departure Mono",
					fontSize: "64px",
					align: "center",
				}
			)
			.setOrigin(0.5);

		this.time.addEvent({
			delay: 1000,
			loop: true,
			callback: this.TEMP_update_count,
			callbackScope: this,
		});
	}

	EVENT_on_shutdown() {
		// console.log("OVERLAY: shutdown");

		// Perform any needed resets
		this.VAR_count = 0;
	}

	TEMP_update_count() {
		if (this.TEXT_count) {
			this.VAR_count += 1;
			this.TEXT_count.setText(`${this.VAR_count}`);
		}
	}
}
