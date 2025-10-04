'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { COLORS } from '@/app/lib/constants';
import type { MinesweeperCell, MinesweeperWindowContent } from '@/app/lib/types';

type GameStatus = 'ready' | 'playing' | 'won' | 'lost';

type Coordinate = { row: number; col: number };

const NEIGHBOR_OFFSETS: ReadonlyArray<Coordinate> = [
	{ row: -1, col: -1 },
	{ row: -1, col: 0 },
	{ row: -1, col: 1 },
	{ row: 0, col: -1 },
	{ row: 0, col: 1 },
	{ row: 1, col: -1 },
	{ row: 1, col: 0 },
	{ row: 1, col: 1 },
];

const NUMBER_COLORS: Record<number, string> = {
	1: '#0000FF',
	2: '#008000',
	3: '#FF0000',
	4: '#000080',
	5: '#800000',
	6: '#008080',
	7: '#000000',
	8: '#808080',
};

const CELL_SIZE = 26;

const wrapperStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	height: '100%',
	backgroundColor: COLORS.WIN_GRAY,
	color: COLORS.TEXT_BLACK,
	borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
	borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
	borderRight: `2px solid ${COLORS.BORDER_DARK}`,
	fontFamily: 'var(--font-sans)',
};

const headerStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '6px 10px',
	borderBottom: `1px solid ${COLORS.BORDER_SHADOW}`,
	fontSize: 12,
};

const controlPanelStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '10px 12px',
	borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
	borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
	borderRight: `2px solid ${COLORS.BORDER_DARK}`,
	margin: '8px 8px 12px',
	backgroundColor: COLORS.WIN_GRAY,
};

const counterStyle: CSSProperties = {
	minWidth: 54,
	textAlign: 'right',
	fontFamily: 'var(--font-mono)',
	fontWeight: 700,
	fontSize: 18,
	color: '#FF2D2D',
	backgroundColor: '#000000',
	padding: '4px 6px',
	border: `2px inset ${COLORS.BORDER_DARK}`,
};

const resetButtonStyle: CSSProperties = {
	width: 36,
	height: 36,
	borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
	borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
	borderRight: `2px solid ${COLORS.BORDER_DARK}`,
	backgroundColor: COLORS.WIN_GRAY,
	cursor: 'pointer',
	fontSize: 18,
	fontWeight: 700,
};

const boardWrapperStyle: CSSProperties = {
	display: 'inline-flex',
	flexDirection: 'column',
	alignSelf: 'center',
	padding: 8,
	backgroundColor: COLORS.WIN_GRAY,
	borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
	borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
	borderRight: `2px solid ${COLORS.BORDER_DARK}`,
};

const gridRowStyle: CSSProperties = {
	display: 'flex',
};

const hiddenCellStyle: CSSProperties = {
	width: CELL_SIZE,
	height: CELL_SIZE,
	borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
	borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
	borderRight: `2px solid ${COLORS.BORDER_DARK}`,
	backgroundColor: COLORS.WIN_GRAY,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontWeight: 700,
	fontSize: 14,
	cursor: 'pointer',
	userSelect: 'none',
	padding: 0,
};

const revealedCellStyle: CSSProperties = {
	width: CELL_SIZE,
	height: CELL_SIZE,
	borderTop: `1px solid ${COLORS.BORDER_SHADOW}`,
	borderLeft: `1px solid ${COLORS.BORDER_SHADOW}`,
	borderBottom: `1px solid ${COLORS.BORDER_DARK}`,
	borderRight: `1px solid ${COLORS.BORDER_DARK}`,
	backgroundColor: COLORS.WIN_WHITE,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	fontWeight: 700,
	fontSize: 14,
	cursor: 'default',
	userSelect: 'none',
	padding: 0,
};

const footerStyle: CSSProperties = {
	marginTop: 'auto',
	padding: '6px 10px',
	fontSize: 11,
	borderTop: `1px solid ${COLORS.BORDER_SHADOW}`,
};

function createEmptyBoard(rows: number, cols: number): MinesweeperCell[][] {
	return Array.from({ length: rows }, () =>
		Array.from({ length: cols }, () => ({
			isMine: false,
			adjacentMines: 0,
			state: 'hidden',
		} satisfies MinesweeperCell)),
	);
}

function cloneBoard(board: MinesweeperCell[][]): MinesweeperCell[][] {
	return board.map((row) => row.map((cell) => ({ ...cell })));
}

function getNeighbors(row: number, col: number, rows: number, cols: number): Coordinate[] {
	const neighbors: Coordinate[] = [];
	for (const offset of NEIGHBOR_OFFSETS) {
		const nextRow = row + offset.row;
		const nextCol = col + offset.col;
		if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
			neighbors.push({ row: nextRow, col: nextCol });
		}
	}
	return neighbors;
}

function generateBoard(
	rows: number,
	cols: number,
	mineCount: number,
	exclude: Coordinate | null,
): MinesweeperCell[][] {
	const board = createEmptyBoard(rows, cols);
	const totalCells = rows * cols;
	const maxMines = Math.max(0, Math.min(mineCount, totalCells - 1));

	const availablePositions: number[] = [];
	for (let index = 0; index < totalCells; index += 1) {
		const row = Math.floor(index / cols);
		const col = index % cols;
		if (exclude && row === exclude.row && col === exclude.col) {
			continue;
		}
		availablePositions.push(index);
	}

	let minesToPlace = maxMines;
	while (minesToPlace > 0 && availablePositions.length > 0) {
		const randomIndex = Math.floor(Math.random() * availablePositions.length);
		const position = availablePositions.splice(randomIndex, 1)[0];
		const mineRow = Math.floor(position / cols);
		const mineCol = position % cols;

		board[mineRow][mineCol].isMine = true;
		minesToPlace -= 1;
	}

	for (let row = 0; row < rows; row += 1) {
		for (let col = 0; col < cols; col += 1) {
			const cell = board[row][col];
			if (cell.isMine) {
				continue;
			}
			const neighbors = getNeighbors(row, col, rows, cols);
			let count = 0;
			for (const neighbor of neighbors) {
				if (board[neighbor.row][neighbor.col].isMine) {
					count += 1;
				}
			}
			cell.adjacentMines = count;
		}
	}

	return board;
}

function floodReveal(board: MinesweeperCell[][], startRow: number, startCol: number) {
	const rows = board.length;
	const cols = rows > 0 ? board[0].length : 0;
	const stack: Coordinate[] = [{ row: startRow, col: startCol }];
	const visited = new Set<string>();

	while (stack.length > 0) {
		const { row, col } = stack.pop() as Coordinate;
		const key = `${row},${col}`;
		if (visited.has(key)) {
			continue;
		}
		visited.add(key);

		const cell = board[row][col];
		if (cell.state === 'flagged' || cell.state === 'revealed') {
			continue;
		}

		cell.state = 'revealed';

		if (cell.adjacentMines === 0) {
			const neighbors = getNeighbors(row, col, rows, cols);
			for (const neighbor of neighbors) {
				const neighborCell = board[neighbor.row][neighbor.col];
				if (neighborCell.state !== 'revealed' && neighborCell.state !== 'flagged') {
					stack.push(neighbor);
				}
			}
		}
	}
}

function checkWinCondition(board: MinesweeperCell[][], mineCount: number) {
	const totalCells = board.length * (board[0]?.length ?? 0);
	let revealed = 0;
	for (const row of board) {
		for (const cell of row) {
			if (cell.state === 'revealed') {
				revealed += 1;
			}
		}
	}
	return totalCells - revealed === mineCount;
}

function revealAllMines(board: MinesweeperCell[][]) {
	for (const row of board) {
		for (const cell of row) {
			if (cell.isMine) {
				cell.state = 'revealed';
			}
		}
	}
}

function flagAllMines(board: MinesweeperCell[][]) {
	for (const row of board) {
		for (const cell of row) {
			if (cell.isMine) {
				cell.state = 'flagged';
			}
		}
	}
}

function formatCounter(value: number) {
	const clamped = Math.max(0, Math.min(value, 999));
	return clamped.toString().padStart(3, '0');
}

function getResetFace(status: GameStatus) {
	if (status === 'won') {
		return ':D';
	}
	if (status === 'lost') {
		return 'X('; 
	}
	if (status === 'playing') {
		return ':)';
	}
	return ':)';
}

export default function Minesweeper({ rows, cols, mines, difficulty, firstClickSafe }: MinesweeperWindowContent) {
	const rowCount = Math.max(1, Math.floor(rows));
	const colCount = Math.max(1, Math.floor(cols));
	const mineTarget = useMemo(() => {
		const totalCells = rowCount * colCount;
		const maxAllowed = Math.max(0, totalCells - 1);
		return Math.max(0, Math.min(Math.floor(mines), maxAllowed));
	}, [rowCount, colCount, mines]);

	const [board, setBoard] = useState<MinesweeperCell[][]>(() => createEmptyBoard(rowCount, colCount));
	const [gameStatus, setGameStatus] = useState<GameStatus>('ready');
	const [flagsRemaining, setFlagsRemaining] = useState(mineTarget);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [firstMove, setFirstMove] = useState(true);
	const [explodedCell, setExplodedCell] = useState<Coordinate | null>(null);

	const timerRef = useRef<number | null>(null);
	const startTimeRef = useRef<number | null>(null);

	const resetTimer = () => {
		if (timerRef.current !== null) {
			window.clearInterval(timerRef.current);
			timerRef.current = null;
		}
	};

	const resetGame = useCallback(() => {
		resetTimer();
		setBoard(createEmptyBoard(rowCount, colCount));
		setGameStatus('ready');
		setFlagsRemaining(mineTarget);
		setElapsedSeconds(0);
		setFirstMove(true);
		setExplodedCell(null);
		startTimeRef.current = null;
	}, [rowCount, colCount, mineTarget]);

	useEffect(() => {
		resetGame();
	}, [resetGame]);

	useEffect(() => {
		if (gameStatus !== 'playing') {
			resetTimer();
			return;
		}

		resetTimer();
		timerRef.current = window.setInterval(() => {
			if (!startTimeRef.current) {
				return;
			}
			const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
			setElapsedSeconds(Math.min(elapsed, 999));
		}, 1000);

		return () => {
			resetTimer();
		};
	}, [gameStatus]);

	useEffect(() => () => resetTimer(), []);

	const handleReveal = (row: number, col: number) => {
		if (gameStatus === 'lost' || gameStatus === 'won') {
			return;
		}

		const currentCell = board[row][col];
		if (currentCell.state === 'flagged' || currentCell.state === 'revealed') {
			return;
		}

		let workingBoard = cloneBoard(board);

		if (firstMove) {
			const flaggedPositions = new Set<string>();
			board.forEach((rowCells, rowIndex) => {
				rowCells.forEach((cell, colIndex) => {
					if (cell.state === 'flagged') {
						flaggedPositions.add(`${rowIndex},${colIndex}`);
					}
				});
			});

			workingBoard = generateBoard(
				rowCount,
				colCount,
				mineTarget,
				firstClickSafe ? { row, col } : null,
			);

			flaggedPositions.forEach((key) => {
				const [flagRow, flagCol] = key.split(',').map(Number);
				if (workingBoard[flagRow] && workingBoard[flagRow][flagCol]) {
					workingBoard[flagRow][flagCol].state = 'flagged';
				}
			});

			setFirstMove(false);
			setGameStatus('playing');
			setElapsedSeconds(0);
			startTimeRef.current = Date.now();
		}

		const cell = workingBoard[row][col];
		if (cell.state === 'flagged' || cell.state === 'revealed') {
			setBoard(workingBoard);
			return;
		}

		if (cell.isMine) {
			cell.state = 'revealed';
			revealAllMines(workingBoard);
			setBoard(workingBoard);
			setGameStatus('lost');
			setExplodedCell({ row, col });
			return;
		}

		floodReveal(workingBoard, row, col);

		if (checkWinCondition(workingBoard, mineTarget)) {
			flagAllMines(workingBoard);
			setGameStatus('won');
			setFlagsRemaining(0);
			setBoard(workingBoard);
			return;
		}

		setBoard(workingBoard);
	};

	const handleToggleFlag = (event: React.MouseEvent, row: number, col: number) => {
		event.preventDefault();
		if (gameStatus === 'lost' || gameStatus === 'won') {
			return;
		}

		const targetCell = board[row][col];
		if (targetCell.state === 'revealed') {
			return;
		}

		const nextBoard = cloneBoard(board);
		const cell = nextBoard[row][col];

		if (cell.state === 'flagged') {
			cell.state = 'hidden';
			setFlagsRemaining((previous) => Math.min(previous + 1, mineTarget));
			setBoard(nextBoard);
			return;
		}

		if (flagsRemaining === 0) {
			return;
		}

		cell.state = 'flagged';
		setFlagsRemaining((previous) => Math.max(previous - 1, 0));
		setBoard(nextBoard);
	};

	const mineCounterDisplay = formatCounter(flagsRemaining);
	const timerDisplay = formatCounter(elapsedSeconds);
	const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

	const statusMessage = useMemo(() => {
		if (gameStatus === 'won') {
			return 'You cleared the minefield!';
		}
		if (gameStatus === 'lost') {
			return 'Boom! That was a mine. Hit reset to try again.';
		}
		return 'Tip: Right-click (or long-press) a tile to place a flag.';
	}, [gameStatus]);

	return (
		<div style={wrapperStyle}>
			<div style={headerStyle}>
				<span>
					Minesweeper | {difficultyLabel}
				</span>
				<span>
					{rowCount} x {colCount} | {mineTarget} mines
				</span>
			</div>

			<div style={controlPanelStyle}>
				<div style={counterStyle}>{mineCounterDisplay}</div>
				<button
					type="button"
					onClick={resetGame}
					style={resetButtonStyle}
					aria-label="Reset game"
				>
					{getResetFace(gameStatus)}
				</button>
				<div style={counterStyle}>{timerDisplay}</div>
			</div>

			<div style={boardWrapperStyle}>
				{board.map((rowCells, rowIndex) => (
					<div key={`row-${rowIndex}`} style={gridRowStyle}>
						{rowCells.map((cell, colIndex) => {
							const key = `${rowIndex}-${colIndex}`;
							let display = '';
							let cellStyle: CSSProperties = { ...hiddenCellStyle };

							const isExploded =
								explodedCell?.row === rowIndex && explodedCell?.col === colIndex;
							const isMisflagged =
								gameStatus === 'lost' && cell.state === 'flagged' && !cell.isMine;

							if (cell.state === 'revealed') {
								cellStyle = { ...revealedCellStyle };
								if (cell.isMine) {
									display = 'M';
									if (isExploded) {
										cellStyle.backgroundColor = '#FF8A8A';
									}
								} else if (cell.adjacentMines > 0) {
									display = String(cell.adjacentMines);
									cellStyle.color = NUMBER_COLORS[cell.adjacentMines] ?? COLORS.TEXT_BLACK;
								}
							} else if (cell.state === 'flagged') {
								cellStyle = { ...hiddenCellStyle };
								cellStyle.color = isMisflagged ? '#800000' : '#B22222';
								cellStyle.cursor = 'pointer';
								display = isMisflagged ? 'X' : 'F';
							} else {
								display = '';
							}

							return (
								<button
									key={key}
									type="button"
									onClick={() => handleReveal(rowIndex, colIndex)}
									onContextMenu={(event) => handleToggleFlag(event, rowIndex, colIndex)}
									style={cellStyle}
									aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
								>
									{display}
								</button>
							);
						})}
					</div>
				))}
			</div>

			<div style={footerStyle}>{statusMessage}</div>
		</div>
	);
}







