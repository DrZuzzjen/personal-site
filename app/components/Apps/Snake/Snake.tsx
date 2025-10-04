'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import SnakeGame from './SnakeGame';
import type { HighScoreEntry, SnakeAppConfig, SnakeSnapshot } from './types';

const BOARD_COLUMNS = 30;
const BOARD_ROWS = 25;
const CELL_SIZE = 20;
const HIGH_SCORES_KEY = 'snake-high-scores';

const NOKIA_BACKGROUND = '#0f1d08';
const NOKIA_CANVAS = '#111f0a';
const NOKIA_GREEN = '#9cb23d';
const NOKIA_TEXT = '#cfe36b';
const NOKIA_DARK = '#070d03';
const NOKIA_GRID = 'rgba(156, 178, 61, 0.12)';
const NOKIA_FOOD = '#d9ff6a';
const NOKIA_HEAD = '#e9ffb0';

const outerFrameStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	backgroundColor: NOKIA_BACKGROUND,
	color: NOKIA_TEXT,
	fontFamily: 'var(--font-mono)',
	letterSpacing: 0.4,
	borderTop: `2px solid ${NOKIA_GREEN}`,
	borderLeft: `2px solid ${NOKIA_GREEN}`,
	borderBottom: `2px solid ${NOKIA_DARK}`,
	borderRight: `2px solid ${NOKIA_DARK}`,
};

const headerStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '8px 12px',
	fontSize: 14,
	backgroundColor: '#15240b',
	borderBottom: `1px solid ${NOKIA_GREEN}`,
};

const contentStyle: CSSProperties = {
	display: 'flex',
	flex: 1,
	gap: 16,
	padding: 16,
	boxSizing: 'border-box',
};

const boardShellStyle: CSSProperties = {
	flex: '0 0 auto',
	position: 'relative',
	borderTop: `2px solid ${NOKIA_GREEN}`,
	borderLeft: `2px solid ${NOKIA_GREEN}`,
	borderBottom: `2px solid ${NOKIA_DARK}`,
	borderRight: `2px solid ${NOKIA_DARK}`,
	backgroundColor: NOKIA_CANVAS,
	boxShadow: `0 0 12px rgba(0, 0, 0, 0.6) inset`,
};

const overlayStyle: CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 12,
	backgroundColor: 'rgba(15, 29, 8, 0.86)',
	textAlign: 'center',
	padding: 24,
	fontSize: 16,
	textTransform: 'uppercase',
};

const sidebarStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 18,
	minWidth: 180,
	fontSize: 13,
};

const panelStyle: CSSProperties = {
	padding: 12,
	borderTop: `1px solid ${NOKIA_GREEN}`,
	borderLeft: `1px solid ${NOKIA_GREEN}`,
	borderBottom: `1px solid ${NOKIA_DARK}`,
	borderRight: `1px solid ${NOKIA_DARK}`,
	backgroundColor: '#14230b',
};

const listStyle: CSSProperties = {
	listStyle: 'decimal',
	margin: '6px 0 0 20px',
	padding: 0,
	display: 'flex',
	flexDirection: 'column',
	gap: 6,
};

const instructionsListStyle: CSSProperties = {
	listStyle: 'none',
	margin: '6px 0 0',
	padding: 0,
	display: 'flex',
	flexDirection: 'column',
	gap: 6,
	textTransform: 'uppercase',
};

function formatShortDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

function buildCellKey(x: number, y: number): string {
	return `${x}:${y}`;
}

export default function Snake(props: SnakeAppConfig) {
	const columns = Math.max(12, Math.floor(props?.columns ?? BOARD_COLUMNS));
	const rows = Math.max(12, Math.floor(props?.rows ?? BOARD_ROWS));
	const initialLength = props?.initialLength ?? undefined;
	const initialSpeedMs = props?.initialSpeedMs ?? undefined;
	const speedIncrementMs = props?.speedIncrementMs ?? undefined;
	const speedIncreaseEvery = props?.speedIncreaseEvery ?? undefined;
	const minimumSpeedMs = props?.minimumSpeedMs ?? undefined;

	const gameRef = useRef<SnakeGame | null>(null);

	if (!gameRef.current) {
		gameRef.current = new SnakeGame({
			columns,
			rows,
			initialLength,
			initialSpeedMs,
			speedIncrementMs,
			speedIncreaseEvery,
			minimumSpeedMs,
		});
	}

	const [snapshot, setSnapshot] = useState<SnakeSnapshot>(() => gameRef.current!.getSnapshot());
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [gameSpeed, setGameSpeed] = useState<number>(() => gameRef.current!.getSpeedMs());
	const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

	const recordedScoreRef = useRef(false);

	useEffect(() => {
		const nextGame = new SnakeGame({
			columns,
			rows,
			initialLength,
			initialSpeedMs,
			speedIncrementMs,
			speedIncreaseEvery,
			minimumSpeedMs,
		});

		gameRef.current = nextGame;
		setSnapshot(nextGame.getSnapshot());
		setGameSpeed(nextGame.getSpeedMs());
		setIsPlaying(false);
		setIsPaused(false);
		recordedScoreRef.current = false;
	}, [columns, rows, initialLength, initialSpeedMs, speedIncrementMs, speedIncreaseEvery, minimumSpeedMs]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		try {
			const stored = window.localStorage.getItem(HIGH_SCORES_KEY);
			if (stored) {
				const parsed = JSON.parse(stored) as HighScoreEntry[];
				if (Array.isArray(parsed)) {
					setHighScores(parsed.slice(0, 5));
				}
			}
		} catch (error) {
			console.warn('Failed to load Snake high scores', error);
		}
	}, []);

	const recordHighScore = useCallback((score: number) => {
		if (score <= 0) {
			return;
		}

		setHighScores((previous) => {
			const nextScores = [...previous, { score, date: new Date().toISOString() }]
				.sort((a, b) => b.score - a.score)
				.slice(0, 5);
			if (typeof window !== 'undefined') {
				try {
					window.localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(nextScores));
				} catch (error) {
					console.warn('Failed to save Snake high scores', error);
				}
			}
			return nextScores;
		});
	}, []);

	const startNewGame = useCallback(() => {
		const game = gameRef.current;
		if (!game) {
			return;
		}
		const nextSnapshot = game.reset();
		setSnapshot(nextSnapshot);
		setGameSpeed(game.getSpeedMs());
		setIsPlaying(true);
		setIsPaused(false);
		recordedScoreRef.current = false;
	}, []);

	const togglePause = useCallback(() => {
		if (!isPlaying) {
			return;
		}
		if (snapshot.isGameOver) {
			return;
		}
		setIsPaused((previous) => !previous);
	}, [isPlaying, snapshot.isGameOver]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === ' ') {
				event.preventDefault();
				if (!isPlaying || snapshot.isGameOver) {
					startNewGame();
				} else {
					togglePause();
				}
				return;
			}

			if (!isPlaying || isPaused) {
				return;
			}

			const game = gameRef.current;
			if (!game) {
				return;
			}

			switch (event.key) {
				case 'ArrowUp':
					event.preventDefault();
					game.setDirection('up');
					break;
				case 'ArrowDown':
					event.preventDefault();
					game.setDirection('down');
					break;
				case 'ArrowLeft':
					event.preventDefault();
					game.setDirection('left');
					break;
				case 'ArrowRight':
					event.preventDefault();
					game.setDirection('right');
					break;
				default:
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isPlaying, isPaused, snapshot.isGameOver, startNewGame, togglePause]);

	useEffect(() => {
		if (!isPlaying || isPaused) {
			return undefined;
		}

		const game = gameRef.current;
		if (!game) {
			return undefined;
		}

		const interval = window.setInterval(() => {
			const result = game.step();
			setSnapshot(result.snapshot);

			if (result.event === 'food' || result.event === 'victory') {
				setGameSpeed(game.getSpeedMs());
			}

			if ((result.event === 'game-over' || result.event === 'victory') && !recordedScoreRef.current) {
				recordedScoreRef.current = true;
				recordHighScore(result.snapshot.score);
				setIsPlaying(false);
				setIsPaused(false);
			}
		}, gameSpeed);

		return () => {
			window.clearInterval(interval);
		};
	}, [isPlaying, isPaused, gameSpeed, recordHighScore]);

	const bestScore = highScores[0]?.score ?? 0;
	const snakeHead = snapshot.snake[0];

	const cells = useMemo(() => {
		const snakeSet = new Set(snapshot.snake.map((segment) => buildCellKey(segment.x, segment.y)));
		const headKey = snakeHead ? buildCellKey(snakeHead.x, snakeHead.y) : null;
		const foodKey = snapshot.food ? buildCellKey(snapshot.food.x, snapshot.food.y) : null;
		const totalCells = rows * columns;

		return Array.from({ length: totalCells }, (_, index) => {
			const x = index % columns;
			const y = Math.floor(index / columns);
			const key = buildCellKey(x, y);
			const isSnake = snakeSet.has(key);
			const isHead = headKey === key;
			const isFood = foodKey === key;

			let backgroundColor = 'transparent';
			let borderRadius = 2;
			let boxShadow: string | undefined;

			if (isFood) {
				backgroundColor = NOKIA_FOOD;
				borderRadius = 4;
				boxShadow = `0 0 6px 0 ${NOKIA_FOOD}`;
			} else if (isHead) {
				backgroundColor = NOKIA_HEAD;
				borderRadius = 2;
				boxShadow = `0 0 4px 0 ${NOKIA_HEAD}`;
			} else if (isSnake) {
				backgroundColor = NOKIA_GREEN;
			}

			return (
				<div
					key={key}
					style={{
						width: CELL_SIZE,
						height: CELL_SIZE,
						boxSizing: 'border-box',
						backgroundColor,
						borderRadius,
						boxShadow,
					}}
				/>
			);
		});
	}, [snapshot.snake, snapshot.food, snakeHead, rows, columns]);

	const boardStyle: CSSProperties = useMemo(
		() => ({
			width: columns * CELL_SIZE,
			height: rows * CELL_SIZE,
			display: 'grid',
			gridTemplateColumns: `repeat(${columns}, ${CELL_SIZE}px)`,
			gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
			gap: 0,
			backgroundColor: NOKIA_CANVAS,
			backgroundImage: `linear-gradient(${NOKIA_GRID} 1px, transparent 1px), linear-gradient(90deg, ${NOKIA_GRID} 1px, transparent 1px)`
				,
			backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
		}),
		[columns, rows],
	);

	const showStartOverlay = !isPlaying && !snapshot.isGameOver && snapshot.score === 0;
	const showPauseOverlay = isPlaying && isPaused && !snapshot.isGameOver;
	const showGameOverOverlay = snapshot.isGameOver;

	return (
		<div style={outerFrameStyle}>
			<div style={headerStyle}>
				<span>Snake.exe</span>
				<span>Score: {snapshot.score}</span>
				<span>Top: {bestScore}</span>
			</div>

			<div style={contentStyle}>
				<div style={{ ...boardShellStyle, width: columns * CELL_SIZE, height: rows * CELL_SIZE }}>
					<div style={boardStyle}>{cells}</div>

					{showStartOverlay && (
						<div style={overlayStyle}>
							<strong>Press Space To Start</strong>
							<span>Arrow Keys Move</span>
						</div>
					)}

					{showPauseOverlay && (
						<div style={overlayStyle}>
							<strong>Paused</strong>
							<span>Press Space To Resume</span>
						</div>
					)}

					{showGameOverOverlay && (
						<div style={overlayStyle}>
							<strong>{snapshot.hasWon ? 'Board Cleared!' : 'Game Over!'}</strong>
							<span>Final Score: {snapshot.score}</span>
							<span>High Score: {bestScore}</span>
							<button
								type="button"
								onClick={startNewGame}
								style={{
									marginTop: 10,
									padding: '6px 16px',
									border: `1px solid ${NOKIA_GREEN}`,
									backgroundColor: '#122008',
									color: NOKIA_TEXT,
									cursor: 'pointer',
									textTransform: 'uppercase',
								}}
							>
								Press Space Or Click To Restart
							</button>
						</div>
					)}
				</div>

				<div style={sidebarStyle}>
					<div style={panelStyle}>
						<strong>High Scores</strong>
						<ol style={listStyle}>
							{highScores.length === 0 && <li>None yet</li>}
							{highScores.map((entry, index) => (
								<li key={`${entry.score}-${entry.date}-${index}`}>
									<span>{entry.score}</span>
									<span style={{ marginLeft: 6, opacity: 0.7 }}>{formatShortDate(entry.date)}</span>
								</li>
							))}
						</ol>
					</div>

					<div style={panelStyle}>
						<strong>Controls</strong>
						<ul style={instructionsListStyle}>
							<li>Arrow Keys: Move</li>
							<li>Space: Start / Pause / Restart</li>
						</ul>
					</div>

					<div style={panelStyle}>
						<strong>Tips</strong>
						<ul style={instructionsListStyle}>
							<li>Speed increases as you grow</li>
							<li>Avoid walls and your own tail</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
