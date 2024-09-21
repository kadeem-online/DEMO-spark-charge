import { Scene, GameObjects, Display } from "phaser";

// utils
import { COLORS, SCENES } from "../utils/config";

export default class StageOverlayScene extends Scene {
	VAR_count: number;
	VAR_energy_bar?: Phaser.GameObjects.Rectangle;
	VAR_energy_start_color: Phaser.Display.Color;
	VAR_energy_end_color: Phaser.Display.Color;
	TEXT_count?: GameObjects.Text;
	energyBarWidth: number = 500;
	energyBarHeight: number = 20;

	constructor() {
		super(SCENES.stage_overlay);
		this.VAR_count = 0;
		this.VAR_energy_start_color = Phaser.Display.Color.ValueToColor(
			COLORS.success.hex
		);
		this.VAR_energy_end_color = Phaser.Display.Color.ValueToColor(
			COLORS.danger.hex
		);
	}

	create() {
		// Events
		this.events.on("shutdown", this.EVENT_on_shutdown, this);

		// Custom Events
		const StageScene = this.scene.get(SCENES.stage);
		StageScene.events.on("updateEnergy", this.EVENT_on_energy_update, this);

		this.CREATE_energy_bar();
	}

	update(time: number, delta: number): void {}

	/*##########################################################################*/
	// CREATE
	/*##########################################################################*/

	CREATE_energy_bar() {
		const x = 300;
		const y = 850;
		const width = this.energyBarWidth;
		const height = this.energyBarHeight;
		const padding = 8;

		const container = this.add.rectangle(
			x,
			y,
			width + padding * 2,
			height + padding * 2
		);
		container.setStrokeStyle(2, COLORS.gray[50].hex);

		this.VAR_energy_bar = this.add.rectangle(
			x - width / 2,
			y - height / 2,
			500,
			20,
			COLORS.success.hex
		);
		this.VAR_energy_bar.setOrigin(0);
	}

	/*##########################################################################*/
	// EVENTS
	/*##########################################################################*/

	EVENT_on_energy_update(energy: number) {
		let width = this.energyBarWidth * (energy / 100);
		const color = this.UTIL_energy_bar_color_interpolation(100, 100 - energy);

		this.VAR_energy_bar?.setDisplaySize(width, this.energyBarHeight);
		this.VAR_energy_bar?.setFillStyle(color);
	}

	EVENT_on_shutdown() {
		// console.log("OVERLAY: shutdown");

		// Perform any needed resets
		this.VAR_count = 0;
	}

	/*##########################################################################*/
	// UTILS
	/*##########################################################################*/

	/**
	 * Returns a value for the interpolation between the COLORS.success[green] and
	 * COLORS.danger[red]. The length for the interpolation. Default length for the
	 * interpolation is 500.
	 *
	 * @param [length=500] {number} - Distance to interpolate over.
	 * @param index {number} - Index to get the interpolation from.
	 */
	UTIL_energy_bar_color_interpolation(length: number = 500, index: number) {
		const color = Display.Color.Interpolate.ColorWithColor(
			this.VAR_energy_start_color,
			this.VAR_energy_end_color,
			length,
			index
		);
		return Phaser.Display.Color.GetColor(color.r, color.g, color.b);
	}

	/*##########################################################################*/
	// TEMPORARY | DEBUG
	/*##########################################################################*/
	TEMP_update_count() {
		if (this.TEXT_count) {
			this.VAR_count += 1;
			this.TEXT_count.setText(`${this.VAR_count}`);
		}
	}

	TEMP_set_bar_color(bar: Phaser.GameObjects.Rectangle) {}
}
