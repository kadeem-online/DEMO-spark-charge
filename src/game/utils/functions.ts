import { GameLevelBlueprint } from "./definitions";

export function CreateGameLevels(level: number = 1): GameLevelBlueprint {
	const min: GameLevelBlueprint = {
		token_speed: 100,
		road_scroll_speed: 0.2,
		token_timer: {
			min: 3500,
			max: 7000,
		},
		vehicle_hitbox_scale: {
			width: 0.95,
			height: 1,
		},
		vehicle_speed: 500,
		vehicle_timer: {
			min: 1200,
			max: 2600,
		},
	};

	const max: GameLevelBlueprint = {
		token_speed: 250,
		road_scroll_speed: 1,
		token_timer: {
			min: 5000,
			max: 8000,
		},
		vehicle_speed: 1250,
		vehicle_hitbox_scale: {
			width: 0.65,
			height: 0.85,
		},
		vehicle_timer: {
			min: 400,
			max: 800,
		},
	};

	if (!level || level <= 0) {
		return min;
	}

	if (level >= 1) {
		return max;
	}

	// round to 2 dp
	level = Number(level.toFixed(2));

	const intermediate: GameLevelBlueprint = {
		token_speed: min.token_speed + (max.token_speed - min.token_speed) * level,
		road_scroll_speed:
			min.road_scroll_speed +
			(max.road_scroll_speed - min.road_scroll_speed) * level,
		token_timer: {
			min:
				min.token_timer.min +
				(max.token_timer.min - min.token_timer.min) * level,
			max:
				min.token_timer.max +
				(max.token_timer.max - min.token_timer.max) * level,
		},
		vehicle_hitbox_scale: {
			width:
				min.vehicle_hitbox_scale.width +
				(max.vehicle_hitbox_scale.width - min.vehicle_hitbox_scale.width) *
					level,
			height:
				min.vehicle_hitbox_scale.height +
				(max.vehicle_hitbox_scale.height - min.vehicle_hitbox_scale.height) *
					level,
		},
		vehicle_speed:
			min.vehicle_speed + (max.vehicle_speed - min.vehicle_speed) * level,
		vehicle_timer: {
			min:
				min.vehicle_timer.min +
				(max.vehicle_timer.min - min.vehicle_timer.min) * level,
			max:
				min.vehicle_timer.max +
				(max.vehicle_timer.max - min.vehicle_timer.max) * level,
		},
	};

	return intermediate;
}
