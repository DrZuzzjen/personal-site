import type {
	Coordinate,
	Direction,
	SnakeGameOptions,
	SnakeSnapshot,
	StepEvent,
	StepResult,
} from './types';

const DEFAULT_INITIAL_LENGTH = 4;
const DEFAULT_INITIAL_SPEED_MS = 180;
const DEFAULT_SPEED_INCREMENT_MS = 12;
const DEFAULT_SPEED_INCREASE_EVERY = 3;
const DEFAULT_MINIMUM_SPEED_MS = 60;

const DIRECTION_VECTORS: Record<Direction, Coordinate> = {
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
};

const OPPOSITES: Record<Direction, Direction> = {
	up: 'down',
	down: 'up',
	left: 'right',
	right: 'left',
};

export default class SnakeGame {
	private readonly columns: number;
	private readonly rows: number;
	private readonly initialLength: number;
	private readonly initialSpeedMs: number;
	private readonly speedIncrementMs: number;
	private readonly speedIncreaseEvery: number;
	private readonly minimumSpeedMs: number;

	private snake: Coordinate[] = [];
	private direction: Direction = 'right';
	private nextDirection: Direction = 'right';
	private food: Coordinate | null = null;
	private score = 0;
	private isGameOver = false;
	private hasWon = false;

	constructor(options: SnakeGameOptions) {
		this.columns = Math.max(4, Math.floor(options.columns));
		this.rows = Math.max(4, Math.floor(options.rows));
		this.initialLength = Math.max(2, Math.floor(options.initialLength ?? DEFAULT_INITIAL_LENGTH));
		this.initialSpeedMs = Math.max(40, Math.floor(options.initialSpeedMs ?? DEFAULT_INITIAL_SPEED_MS));
		this.speedIncrementMs = Math.max(1, Math.floor(options.speedIncrementMs ?? DEFAULT_SPEED_INCREMENT_MS));
		this.speedIncreaseEvery = Math.max(1, Math.floor(options.speedIncreaseEvery ?? DEFAULT_SPEED_INCREASE_EVERY));
		this.minimumSpeedMs = Math.max(20, Math.floor(options.minimumSpeedMs ?? DEFAULT_MINIMUM_SPEED_MS));

		this.reset();
	}

	reset(): SnakeSnapshot {
		const centerX = Math.floor(this.columns / 2);
		const centerY = Math.floor(this.rows / 2);

		this.direction = 'right';
		this.nextDirection = 'right';
		this.score = 0;
		this.isGameOver = false;
		this.hasWon = false;

		this.snake = Array.from({ length: this.initialLength }, (_, index) => ({
			x: centerX - index,
			y: centerY,
		}));

		this.spawnFood();

		return this.getSnapshot();
	}

	setDirection(direction: Direction): void {
		if (this.isGameOver) {
			return;
		}

		if (direction === this.nextDirection) {
			return;
		}

		const currentDirection = this.direction;
		if (direction === OPPOSITES[currentDirection]) {
			return;
		}

		this.nextDirection = direction;
	}

	step(): StepResult {
		if (this.isGameOver) {
			return {
				event: this.hasWon ? 'victory' : 'game-over',
				snapshot: this.getSnapshot(),
			};
		}

		this.direction = this.nextDirection;
		const vector = DIRECTION_VECTORS[this.direction];
		const head = this.snake[0];
		const nextHead: Coordinate = { x: head.x + vector.x, y: head.y + vector.y };

		if (this.detectCollision(nextHead)) {
			this.isGameOver = true;
			return {
				event: 'game-over',
				snapshot: this.getSnapshot(),
			};
		}

		const ateFood = this.food !== null && nextHead.x === this.food.x && nextHead.y === this.food.y;
		const newSnake = [nextHead, ...this.snake];

		if (!ateFood) {
			newSnake.pop();
		} else {
			this.score += 1;
			this.spawnFood();
		}

		this.snake = newSnake;

		let event: StepEvent = ateFood ? 'food' : 'move';
		if (this.hasWon && this.isGameOver) {
			event = 'victory';
		}

		return {
			event,
			snapshot: this.getSnapshot(),
		};
	}

	getSpeedMs(): number {
		const speedBoosts = Math.floor(this.score / this.speedIncreaseEvery);
		const nextSpeed = this.initialSpeedMs - speedBoosts * this.speedIncrementMs;
		return Math.max(this.minimumSpeedMs, nextSpeed);
	}

	getColumns(): number {
		return this.columns;
	}

	getRows(): number {
		return this.rows;
	}

	getSnapshot(): SnakeSnapshot {
		return {
			snake: this.snake.map((segment) => ({ ...segment })),
			food: this.food ? { ...this.food } : null,
			direction: this.direction,
			score: this.score,
			isGameOver: this.isGameOver,
			hasWon: this.hasWon,
		};
	}

	private detectCollision(position: Coordinate): boolean {
		const outOfBounds =
			position.x < 0 ||
			position.x >= this.columns ||
			position.y < 0 ||
			position.y >= this.rows;

		if (outOfBounds) {
			return true;
		}

		return this.snake.some((segment) => segment.x === position.x && segment.y === position.y);
	}

	private spawnFood(): void {
		const openCells: Coordinate[] = [];
		for (let y = 0; y < this.rows; y += 1) {
			for (let x = 0; x < this.columns; x += 1) {
				const occupied = this.snake.some((segment) => segment.x === x && segment.y === y);
				if (!occupied) {
					openCells.push({ x, y });
				}
			}
		}

		if (openCells.length === 0) {
			this.food = null;
			this.hasWon = true;
			this.isGameOver = true;
			return;
		}

		const randomIndex = Math.floor(Math.random() * openCells.length);
		this.food = openCells[randomIndex];
	}
}
