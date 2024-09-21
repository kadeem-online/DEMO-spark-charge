import { Scene, GameObjects, Types } from "phaser";

// rex components
import Button from "phaser3-rex-plugins/plugins/button";
import {
	Sizer,
	ScrollablePanel,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import RoundRectangle from "phaser3-rex-plugins/plugins/roundrectangle";

// utils
import { COLORS, SCENES } from "../utils/config";
import { InfoScenPayload } from "../utils/definitions";

export default class Info extends Scene {
	exitScene?: string;

	constructor() {
		super(SCENES.info);
	}

	init(data: InfoScenPayload) {
		this.exitScene = data.trigger || "MainMenu";
	}

	create() {
		// events
		this.events.on("ready", this.EVENT_on_ready, this);

		// scene background
		this.CREATE_scene_background();

		// scene UI and content
		this.SETUP_scrollable_panel();
		this.SETUP_scene_exit_button();
	}

	ACTION_leave_scene() {
		this.scene.stop(this.scene.key);
		if (this.exitScene) {
			this.scene.run(this.exitScene);
		} else {
			this.scene.run("MainMenu");
		}
		return;
	}

	CREATE_scene_background() {
		this.add.image(
			Number(this.game.config.width) / 2,
			Number(this.game.config.height) / 2,
			"menu-background"
		);
	}

	EVENT_on_ready() {
		this.scene.bringToTop(this.scene.key);
	}

	GENERATE_info_content(max_width: number): GameObjects.GameObject[] {
		const content: GameObjects.GameObject[] = [];

		type FontStyles = {
			[key: string]: Partial<Types.GameObjects.Text.TextStyle>;
		};

		const ContentTextSytles: FontStyles = {
			heading: {
				color: COLORS.azure[900].css,
				fontFamily: "Departure Mono",
				fontSize: "32px",
				fontStyle: "bold",
				fixedWidth: max_width,
				wordWrap: {
					width: max_width,
				},
			},
			sub_heading: {
				color: COLORS.azure[900].css,
				fontFamily: "Departure Mono",
				fontSize: "28px",
				fontStyle: "bold",
				fixedWidth: max_width,
				wordWrap: {
					width: max_width,
				},
			},
			default: {
				color: COLORS.azure[800].css,
				fontFamily: "Departure Mono",
				fontSize: "24px",
				fixedWidth: max_width,
				wordWrap: {
					width: max_width,
				},
			},
		};

		// Main Title
		const title_text = "How to Play";
		const title = this.add.text(0, 0, title_text, ContentTextSytles.heading);
		content.push(title);

		// paragraph 1 [gameplay overview]
		const par_1_text = `In Charge Quest, you’ll navigate your electric vehicle through an endless city, collecting energy tokens and reaching charging bays to keep your car powered up. The longer you drive, the faster the game gets!`;
		const par_1 = this.add.text(0, 0, par_1_text, ContentTextSytles.default);
		content.push(par_1);

		// subheading 1 [keyboard control heading]
		const subhead_1_text = `Controls {Keyboard}`;
		const subhead_1 = this.add.text(
			0,
			0,
			subhead_1_text,
			ContentTextSytles.sub_heading
		);
		content.push(subhead_1);

		// paragraph 2 [keyboard control details]
		const par_2_text = `Use the A key or Left key to move left. \n\nUse the D key or Right key to move right.`;
		const par_2 = this.add.text(0, 0, par_2_text, ContentTextSytles.default);
		content.push(par_2);

		// subheading 2 [touch control heading]
		const subhead_2_text = `Controls {Touch}`;
		const subhead_2 = this.add.text(
			0,
			0,
			subhead_2_text,
			ContentTextSytles.sub_heading
		);
		content.push(subhead_2);

		// paragraph 3 [touch controls details]
		const par_3_text = `Tap the left side of your screen to move left \n\nTap the right side of your screen to move right`;
		const par_3 = this.add.text(0, 0, par_3_text, ContentTextSytles.default);
		content.push(par_3);

		// subheading 3 [Goal heading]
		const subhead_3_text = `Goal:`;
		const subhead_3 = this.add.text(
			0,
			0,
			subhead_3_text,
			ContentTextSytles.sub_heading
		);
		content.push(subhead_3);

		// paragraph 4 [Goal details]
		const par_4_text = `Collect renewable energy tokens to recharge your vehicle and stay in the game longer. Reach the Smart Charging Bays to get a full battery boost and keep driving further!`;
		const par_4 = this.add.text(0, 0, par_4_text, ContentTextSytles.default);
		content.push(par_4);

		return content;
	}

	SETUP_scene_exit_button() {
		const center_x = 300;
		const center_y = 810;
		const button_height = 80;
		const button_width = 350;
		const button_text = `Back`;

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
				this.ACTION_leave_scene();
			},
			this
		);
	}

	SETUP_scrollable_panel() {
		const panel_background = new RoundRectangle(
			this,
			0,
			0,
			540,
			690,
			20,
			COLORS.azure[200].hex,
			0.95
		);
		panel_background.setStrokeStyle(4, COLORS.azure[800].hex);
		this.add.existing(panel_background);

		const panel_scrollbar_track = new RoundRectangle(
			this,
			0,
			0,
			30,
			650,
			15,
			COLORS.azure[700].hex
		);
		this.add.existing(panel_scrollbar_track);

		const panel_scrollbar_thumb = this.add.circle(
			0,
			0,
			20,
			COLORS.azure[900].hex
		);
		panel_scrollbar_thumb.setStrokeStyle(4, COLORS.azure[500].hex);

		const panel_config: ScrollablePanel.IConfig = {
			background: panel_background,
			height: 690,
			panel: {
				child: this.SETUP_scrollable_panel_child(),
			},
			slider: {
				track: panel_scrollbar_track,
				thumb: panel_scrollbar_thumb,
			},
			space: {
				bottom: 20,
				left: 20,
				// panel: 20,
				right: 20,
				top: 20,
			},
			width: 540,
			x: 300,
			y: 375,
		};

		const panel = new ScrollablePanel(this, panel_config);
		panel.layout();
	}

	SETUP_scrollable_panel_child() {
		const max_width = 450;
		const content_gap = 20;
		const sizer_config: Sizer.IConfig = {
			anchor: {
				// left: "0",
			},
			orientation: "vertical",
			space: {
				item: content_gap,
			},
			width: max_width,
		};
		const sizer = new Sizer(this, sizer_config);

		const content_list = this.GENERATE_info_content(max_width);
		content_list.forEach((value) => {
			sizer.add(value);
		});

		return sizer;
	}
}
