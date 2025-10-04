export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Coordinate {
	x: number;
	y: number;
}

export interface SnakeGameOptions {
	columns: number;
	rows: number;
	initialLength?: number;
	initialSpeedMs?: number;
	speedIncrementMs?: number;
	speedIncreaseEvery?: number;
	minimumSpeedMs?: number;
}

export interface SnakeSnapshot {
	snake: Coordinate[];
	food: Coordinate | null;
	direction: Direction;
	score: number;
	isGameOver: boolean;
	hasWon: boolean;
}

export type StepEvent = 'move' | 'food' | 'game-over' | 'victory';

export interface StepResult {
	event: StepEvent;
	snapshot: SnakeSnapshot;
}

export interface HighScoreEntry {
	score: number;
	date: string;
}

export interface SnakeAppConfig {
	columns?: number;
	rows?: number;
	initialLength?: number;
	initialSpeedMs?: number;
	speedIncrementMs?: number;
	speedIncreaseEvery?: number;
	minimumSpeedMs?: number;
}
