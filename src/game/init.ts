import * as Phaser from "phaser";

export default function startGame(): Phaser.Game {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		width: 600,
		height: 900,
		parent: "charge-race-challenge",
		fullscreenTarget: "charge-race-challenge",
		scale: {
			mode: Phaser.Scale.ScaleModes.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
		},
	};
	const game = new Phaser.Game(config);
	return game;
}
