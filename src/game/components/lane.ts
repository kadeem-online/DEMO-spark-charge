export default class Lane {
	x: number;
	open: boolean;
	private _cooldown: number;

	constructor(x: number) {
		this.x = x;
		this.open = true;
		this._cooldown = 0;
	}

	set cooldown(value: number) {
		if (value < 0) {
			value = 0;
		}
		this._cooldown = value;
		return;
	}

	get cooldown(): number {
		return this._cooldown;
	}

	openLane() {
		this.open = true;
	}

	closeLane() {
		this.open = false;
	}

	isOpen() {
		return this.open;
	}
}
