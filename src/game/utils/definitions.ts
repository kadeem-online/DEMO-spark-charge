export type InfoScenPayload = {
	trigger: string; // the key of the scene that launched the info scene
};

export type StageScenePayload = {
	restart?: boolean;
};

export type GameState = "PREGAME" | "RUNNING" | "GAMEOVER";

export type PlayerDirection = {
	left: boolean;
	right: boolean;
};
