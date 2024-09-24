export type InfoScenPayload = {
	trigger: string; // the key of the scene that launched the info scene
};

export type StageScenePayload = {
	restart?: boolean;
};

export type GameOverScenePayload = {
	score: number;
};

export type GameState = "PREGAME" | "RUNNING" | "GAMEOVER";

export type PlayerDirection = {
	left: boolean;
	right: boolean;
};

export type TokenOptions = "hydro" | "wind" | "solar";
export const TOKENS: TokenOptions[] = ["hydro", "wind", "solar"];

export type GameLevelBlueprint = {
	next?: GameLevelBlueprint;
	road_scroll_speed: number;
	score_per_second: number;
	token_speed: number;
	token_timer: {
		min: number;
		max: number;
	};
	vehicle_hitbox_scale: {
		width: number;
		height: number;
	};
	vehicle_speed: number;
	vehicle_timer: {
		min: number;
		max: number;
	};
};
