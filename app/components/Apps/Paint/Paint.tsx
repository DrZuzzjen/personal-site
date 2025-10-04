'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { COLORS } from '@/app/lib/constants';
import type { PaintWindowContent } from '@/app/lib/types';

export type PaintProps = PaintWindowContent;

type Tool = 'brush' | 'eraser';

type Point = { x: number; y: number };

const DEFAULT_PALETTE = [
	'#000000',
	'#FFFFFF',
	'#FF0000',
	'#00FF00',
	'#0000FF',
	'#FFFF00',
	'#FF00FF',
	'#00FFFF',
];

const containerStyle: CSSProperties = {
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

const toolbarStyle: CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap',
	gap: 12,
	padding: '8px 10px',
	borderBottom: `1px solid ${COLORS.BORDER_SHADOW}`,
	backgroundColor: COLORS.WIN_GRAY,
	fontSize: 11,
};

const groupStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
};

const sectionLabelStyle: CSSProperties = {
	fontWeight: 700,
};

const canvasSectionStyle: CSSProperties = {
	display: 'flex',
	flex: 1,
	alignItems: 'center',
	justifyContent: 'center',
	padding: 12,
};

const statusBarStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '6px 10px',
	fontSize: 11,
	borderTop: `1px solid ${COLORS.BORDER_SHADOW}`,
};

const paletteContainerStyle: CSSProperties = {
	display: 'grid',
	gridTemplateColumns: 'repeat(8, 22px)',
	gap: 4,
};

const brushSizes = [2, 4, 6, 10, 16];

function raisedButtonStyle(active: boolean): CSSProperties {
	return {
		borderTop: `2px solid ${active ? COLORS.BORDER_SHADOW : COLORS.BORDER_LIGHT}`,
		borderLeft: `2px solid ${active ? COLORS.BORDER_DARK : COLORS.BORDER_HIGHLIGHT}`,
		borderBottom: `2px solid ${active ? COLORS.BORDER_LIGHT : COLORS.BORDER_SHADOW}`,
		borderRight: `2px solid ${active ? COLORS.BORDER_HIGHLIGHT : COLORS.BORDER_DARK}`,
		backgroundColor: COLORS.WIN_GRAY,
		color: COLORS.TEXT_BLACK,
		padding: '4px 8px',
		minWidth: 48,
		textAlign: 'center',
		fontSize: 11,
		cursor: 'pointer',
	};
}

function colorSwatchStyle(color: string, active: boolean): CSSProperties {
	return {
		width: 22,
		height: 22,
		backgroundColor: color,
		border: active ? `2px solid ${COLORS.TEXT_BLACK}` : `1px solid ${COLORS.BORDER_DARK}`,
		boxSizing: 'border-box',
		cursor: 'pointer',
	};
}

export default function Paint({
	canvasWidth,
	canvasHeight,
	brushSize,
	backgroundColor,
	palette,
}: PaintProps) {
	const width = Math.max(160, Math.floor(canvasWidth));
	const height = Math.max(120, Math.floor(canvasHeight));
	const effectiveBackground = backgroundColor ?? COLORS.WIN_WHITE;
	const colors = useMemo(
		() => (palette.length > 0 ? palette : DEFAULT_PALETTE),
		[palette],
	);

	const [currentColor, setCurrentColor] = useState(colors[0] ?? '#000000');
	const [brushSizeState, setBrushSizeState] = useState(Math.max(1, Math.floor(brushSize)));
	const [tool, setTool] = useState<Tool>('brush');

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const drawingRef = useRef(false);
	const lastPointRef = useRef<Point | null>(null);

	useEffect(() => {
		setCurrentColor((previous) => (colors.includes(previous) ? previous : colors[0] ?? '#000000'));
	}, [colors]);

	useEffect(() => {
		setBrushSizeState(Math.max(1, Math.floor(brushSize)));
	}, [brushSize]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		const ratio = window.devicePixelRatio || 1;
		canvas.width = width * ratio;
		canvas.height = height * ratio;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		ctx.fillStyle = effectiveBackground;
		ctx.fillRect(0, 0, width, height);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctxRef.current = ctx;
		drawingRef.current = false;
		lastPointRef.current = null;
	}, [width, height, effectiveBackground]);

	const toCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>): Point | null => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return null;
		}
		const rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		};
	};

	const drawLine = (from: Point, to: Point) => {
		const ctx = ctxRef.current;
		if (!ctx) {
			return;
		}
		ctx.globalCompositeOperation = 'source-over';
		ctx.strokeStyle = tool === 'eraser' ? effectiveBackground : currentColor;
		ctx.lineWidth = brushSizeState;
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
	};

	const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
		event.preventDefault();
		const point = toCanvasPoint(event);
		if (!point) {
			return;
		}

		drawingRef.current = true;
		lastPointRef.current = point;
		drawLine(point, point);

		const canvas = canvasRef.current;
		if (canvas) {
			canvas.setPointerCapture(event.pointerId);
		}
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (!drawingRef.current || !lastPointRef.current) {
			return;
		}
		const point = toCanvasPoint(event);
		if (!point) {
			return;
		}

		drawLine(lastPointRef.current, point);
		lastPointRef.current = point;
	};

	const stopDrawing = (event?: React.PointerEvent<HTMLCanvasElement>) => {
		if (!drawingRef.current) {
			return;
		}
		drawingRef.current = false;
		lastPointRef.current = null;
		if (event) {
			const canvas = canvasRef.current;
			if (canvas && canvas.hasPointerCapture(event.pointerId)) {
				canvas.releasePointerCapture(event.pointerId);
			}
		}
	};

	const handleClear = () => {
		const ctx = ctxRef.current;
		if (!ctx) {
			return;
		}
		ctx.save();
		ctx.globalCompositeOperation = 'source-over';
		ctx.fillStyle = effectiveBackground;
		ctx.fillRect(0, 0, width, height);
		ctx.restore();
	};

	const handleDownload = () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}
		const link = document.createElement('a');
		link.href = canvas.toDataURL('image/png');
		link.download = 'paint-art.png';
		link.click();
	};

	return (
		<div style={containerStyle}>
			<div style={toolbarStyle}>
				<div style={groupStyle}>
					<span style={sectionLabelStyle}>Tool:</span>
					<button
						type="button"
						onClick={() => setTool('brush')}
						style={raisedButtonStyle(tool === 'brush')}
					>
						Brush
					</button>
					<button
						type="button"
						onClick={() => setTool('eraser')}
						style={raisedButtonStyle(tool === 'eraser')}
					>
						Eraser
					</button>
				</div>

				<div style={groupStyle}>
					<span style={sectionLabelStyle}>Brush Size:</span>
					{brushSizes.map((size) => (
						<button
							key={size}
							type="button"
							onClick={() => setBrushSizeState(size)}
							style={raisedButtonStyle(brushSizeState === size)}
						>
							{size}px
						</button>
					))}
				</div>

				<div style={groupStyle}>
					<span style={sectionLabelStyle}>Colors:</span>
					<div style={paletteContainerStyle}>
						{colors.map((color) => (
							<button
								key={color}
								type="button"
								onClick={() => {
									setCurrentColor(color);
									setTool('brush');
								}}
								style={colorSwatchStyle(color, tool === 'brush' && currentColor === color)}
								aria-label={`Select color ${color}`}
							/>
						))}
					</div>
				</div>

				<div style={groupStyle}>
					<button
						type="button"
						onClick={handleClear}
						style={raisedButtonStyle(false)}
					>
						Clear
					</button>
					<button
						type="button"
						onClick={handleDownload}
						style={raisedButtonStyle(false)}
					>
						Save PNG
					</button>
				</div>
			</div>

			<div style={canvasSectionStyle}>
				<canvas
					ref={canvasRef}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={stopDrawing}
					onPointerCancel={stopDrawing}
					onPointerLeave={stopDrawing}
					style={{
						width,
						height,
						cursor: tool === 'eraser' ? 'cell' : 'crosshair',
						backgroundColor: effectiveBackground,
						touchAction: 'none',
						borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
						borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
						borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
						borderRight: `2px solid ${COLORS.BORDER_DARK}`,
					}}
				/>
			</div>

			<div style={statusBarStyle}>
				<span>Tool: {tool === 'brush' ? 'Brush' : 'Eraser'}</span>
				<span>Color: {tool === 'eraser' ? 'Background' : currentColor}</span>
				<span>Brush: {brushSizeState}px</span>
				<span>Canvas: {width} x {height}</span>
			</div>
		</div>
	);
}

