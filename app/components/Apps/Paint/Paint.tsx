'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { COLORS } from '@/app/lib/constants';
import type { PaintWindowContent } from '@/app/lib/types';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';

export type PaintProps = PaintWindowContent;

type Tool = 'brush' | 'eraser';

type Point = { x: number; y: number };

const DEFAULT_PALETTE = [
	'#000000', // Black
	'#FFFFFF', // White
	'#FF0000', // Red
	'#00FF00', // Green
	'#0000FF', // Blue
	'#FFFF00', // Yellow
	'#FF00FF', // Magenta
	'#00FFFF', // Cyan
	'#FFA500', // Orange
	'#800080', // Purple
	'#A52A2A', // Brown
	'#808080', // Gray
	'#FFC0CB', // Pink
	'#90EE90', // Light Green
	'#87CEEB', // Sky Blue
	'#F0E68C', // Khaki
];

const containerStyle: CSSProperties = {
	display: 'flex',
	height: '100%',
	backgroundColor: COLORS.WIN_GRAY,
	color: COLORS.TEXT_BLACK,
	fontFamily: 'var(--font-sans)',
};

// Sidebar for tools, sizes, and colors
const sidebarStyle: CSSProperties = {
	width: 140,
	display: 'flex',
	flexDirection: 'column',
	backgroundColor: COLORS.WIN_GRAY,
	borderRight: `2px solid ${COLORS.BORDER_SHADOW}`,
	padding: 8,
	gap: 12,
};

// Main canvas area
const canvasAreaStyle: CSSProperties = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
};

const canvasSectionStyle: CSSProperties = {
	display: 'flex',
	flex: 1,
	alignItems: 'center',
	justifyContent: 'center',
	padding: 16,
	backgroundColor: COLORS.WIN_GRAY,
};

const statusBarStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '6px 12px',
	fontSize: 11,
	borderTop: `2px solid ${COLORS.BORDER_SHADOW}`,
	backgroundColor: COLORS.WIN_GRAY,
};

// Section headers in sidebar
const sectionHeaderStyle: CSSProperties = {
	fontSize: 11,
	fontWeight: 'bold',
	color: COLORS.TEXT_BLACK,
	marginBottom: 4,
	textAlign: 'center',
};

// Tool buttons (large and professional with proper Windows 3.1 styling)
const toolButtonStyle = (active: boolean): CSSProperties => ({
	width: '100%',
	height: 42,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 6,
	fontSize: 11,
	fontWeight: active ? 'bold' : 'normal',
	backgroundColor: COLORS.WIN_GRAY,
	color: COLORS.TEXT_BLACK,
	// Windows 3.1 button effect - sunken when selected, raised when not
	borderTop: active
		? `2px solid ${COLORS.BORDER_SHADOW}` // SUNKEN
		: `2px solid ${COLORS.BORDER_LIGHT}`, // RAISED
	borderLeft: active
		? `2px solid ${COLORS.BORDER_DARK}`
		: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
	borderBottom: active
		? `2px solid ${COLORS.BORDER_LIGHT}`
		: `2px solid ${COLORS.BORDER_SHADOW}`,
	borderRight: active
		? `2px solid ${COLORS.BORDER_HIGHLIGHT}`
		: `2px solid ${COLORS.BORDER_DARK}`,
	cursor: 'pointer',
	padding: '8px 12px',
	marginBottom: 2,
	transition: 'none',
});

// Brush size buttons with visual preview
const brushSizeButtonStyle = (
	size: number,
	active: boolean
): CSSProperties => ({
	width: '100%',
	height: 36,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: '0 8px',
	fontSize: 11,
	backgroundColor: active ? COLORS.WIN_BLUE : COLORS.WIN_GRAY,
	color: active ? COLORS.WIN_WHITE : COLORS.TEXT_BLACK,
	border: active
		? `2px solid ${COLORS.BORDER_DARK}`
		: `1px solid ${COLORS.BORDER_SHADOW}`,
	cursor: 'pointer',
	marginBottom: 2,
});

// Color palette grid
const colorPaletteStyle: CSSProperties = {
	display: 'grid',
	gridTemplateColumns: 'repeat(4, 1fr)',
	gap: 4,
	marginTop: 4,
};

// Individual color swatch
const colorSwatchStyle = (color: string, active: boolean): CSSProperties => ({
	width: 28,
	height: 28,
	backgroundColor: color,
	border: active
		? `3px solid ${COLORS.WIN_BLUE}`
		: `2px solid ${COLORS.BORDER_DARK}`,
	cursor: 'pointer',
	borderRadius: 2,
});

// Action buttons (Clear, Save)
const actionButtonStyle: CSSProperties = {
	width: '100%',
	height: 32,
	fontSize: 11,
	backgroundColor: COLORS.WIN_GRAY,
	color: COLORS.TEXT_BLACK,
	border: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderTopColor: COLORS.BORDER_LIGHT,
	borderLeftColor: COLORS.BORDER_HIGHLIGHT,
	borderBottomColor: COLORS.BORDER_SHADOW,
	borderRightColor: COLORS.BORDER_DARK,
	cursor: 'pointer',
	marginBottom: 4,
};

// Zoom controls
const zoomControlsStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 4,
	padding: '4px 0',
	marginBottom: 8,
};

const zoomButtonStyle: CSSProperties = {
	width: 28,
	height: 24,
	fontSize: 12,
	fontWeight: 'bold',
	backgroundColor: COLORS.WIN_GRAY,
	color: COLORS.TEXT_BLACK,
	border: `2px solid ${COLORS.BORDER_LIGHT}`,
	borderTopColor: COLORS.BORDER_LIGHT,
	borderLeftColor: COLORS.BORDER_HIGHLIGHT,
	borderBottomColor: COLORS.BORDER_SHADOW,
	borderRightColor: COLORS.BORDER_DARK,
	cursor: 'pointer',
};

const brushSizes = [2, 4, 6, 10, 16, 20];

export default function Paint({
	canvasWidth,
	canvasHeight,
	brushSize,
	backgroundColor,
	palette,
	backgroundImage,
}: PaintProps) {
	// Use much larger default canvas size for professional look
	const width = Math.max(600, Math.floor(canvasWidth));
	const height = Math.max(400, Math.floor(canvasHeight));
	const effectiveBackground = backgroundColor ?? COLORS.WIN_WHITE;
	const colors = useMemo(
		() => (palette.length > 0 ? palette : DEFAULT_PALETTE),
		[palette]
	);

	const [currentColor, setCurrentColor] = useState(colors[0] ?? '#000000');
	const [brushSizeState, setBrushSizeState] = useState(
		Math.max(1, Math.floor(brushSize))
	);
	const [tool, setTool] = useState<Tool>('brush');
	const [zoom, setZoom] = useState(1); // 1 = 100%, 0.5 = 50%, 2 = 200%
	const [showOpenDialog, setShowOpenDialog] = useState(false);

	const { rootItems } = useFileSystemContext();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const drawingRef = useRef(false);
	const lastPointRef = useRef<Point | null>(null);

	useEffect(() => {
		setCurrentColor((previous) =>
			colors.includes(previous) ? previous : colors[0] ?? '#000000'
		);
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
		
		// Fill background color first
		ctx.fillStyle = effectiveBackground;
		ctx.fillRect(0, 0, width, height);

		// Load background image if provided (for screenshots from Camera app)
		if (backgroundImage) {
			const img = new Image();
			img.onload = () => {
				// Calculate dimensions to fit the image properly
				const imgAspect = img.width / img.height;
				const canvasAspect = width / height;
				
				let drawWidth = width;
				let drawHeight = height;
				let offsetX = 0;
				let offsetY = 0;

				// Scale to fit while maintaining aspect ratio
				if (imgAspect > canvasAspect) {
					// Image is wider than canvas
					drawHeight = width / imgAspect;
					offsetY = (height - drawHeight) / 2;
				} else {
					// Image is taller than canvas
					drawWidth = height * imgAspect;
					offsetX = (width - drawWidth) / 2;
				}

				ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
			};
			img.src = backgroundImage;
		}

		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctxRef.current = ctx;
		drawingRef.current = false;
		lastPointRef.current = null;
	}, [width, height, effectiveBackground, backgroundImage]);

	const toCanvasPoint = (
		event: React.PointerEvent<HTMLCanvasElement>
	): Point | null => {
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

	const handleOpenImage = (imageData: string) => {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		if (!canvas || !ctx) return;

		// Clear canvas first
		ctx.fillStyle = effectiveBackground;
		ctx.fillRect(0, 0, width, height);

		// Load and draw the image
		const img = new Image();
		img.onload = () => {
			// Calculate dimensions to fit the image properly
			const imgAspect = img.width / img.height;
			const canvasAspect = width / height;
			
			let drawWidth = width;
			let drawHeight = height;
			let offsetX = 0;
			let offsetY = 0;

			// Scale to fit while maintaining aspect ratio
			if (imgAspect > canvasAspect) {
				// Image is wider than canvas
				drawHeight = width / imgAspect;
				offsetY = (height - drawHeight) / 2;
			} else {
				// Image is taller than canvas
				drawWidth = height * imgAspect;
				offsetX = (width - drawWidth) / 2;
			}

			ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
		};
		img.src = imageData;
		setShowOpenDialog(false);
	};

	// Get all PNG files from the file system
	const getAllPngFiles = () => {
		const pngFiles: Array<{ name: string; path: string; imageData: string }> = [];
		
		const searchItems = (items: typeof rootItems) => {
			items.forEach(item => {
				if (item.extension === 'png' && item.imageData) {
					pngFiles.push({
						name: item.name,
						path: item.path,
						imageData: item.imageData
					});
				}
				if (item.children) {
					searchItems(item.children);
				}
			});
		};
		
		searchItems(rootItems);
		return pngFiles;
	};

	return (
		<div style={containerStyle}>
			{/* Left Sidebar with Tools, Sizes, Colors */}
			<div style={sidebarStyle}>
				{/* Tools Section */}
				<div>
					<div style={sectionHeaderStyle}>TOOLS</div>
					<button
						type='button'
						onClick={() => setTool('brush')}
						style={toolButtonStyle(tool === 'brush')}
					>
						🖌️ Brush
					</button>
					<button
						type='button'
						onClick={() => setTool('eraser')}
						style={toolButtonStyle(tool === 'eraser')}
					>
						🧹 Eraser
					</button>
				</div>

				{/* Brush Sizes Section */}
				<div>
					<div style={sectionHeaderStyle}>BRUSH SIZE</div>
					{brushSizes.map((size) => (
						<button
							key={size}
							type='button'
							onClick={() => setBrushSizeState(size)}
							style={brushSizeButtonStyle(size, brushSizeState === size)}
						>
							<div
								style={{
									width: Math.min(size, 16),
									height: Math.min(size, 16),
									borderRadius: '50%',
									backgroundColor: 'currentColor',
								}}
							/>
							<span>{size}px</span>
						</button>
					))}
				</div>

				{/* Colors Section */}
				<div>
					<div style={sectionHeaderStyle}>COLORS</div>
					<div style={colorPaletteStyle}>
						{colors.map((color) => (
							<button
								key={color}
								type='button'
								onClick={() => {
									setCurrentColor(color);
									setTool('brush');
								}}
								style={colorSwatchStyle(
									color,
									tool === 'brush' && currentColor === color
								)}
								aria-label={`Select color ${color}`}
								title={color}
							/>
						))}
					</div>
				</div>

				{/* Action Buttons */}
				<div style={{ marginTop: 'auto' }}>
					{/* Zoom Controls */}
					<div>
						<div style={sectionHeaderStyle}>ZOOM</div>
						<div style={zoomControlsStyle}>
							<button
								type='button'
								onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
								style={zoomButtonStyle}
								disabled={zoom <= 0.25}
							>
								-
							</button>
							<span style={{ fontSize: 10, minWidth: 40, textAlign: 'center' }}>
								{Math.round(zoom * 100)}%
							</span>
							<button
								type='button'
								onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
								style={zoomButtonStyle}
								disabled={zoom >= 4}
							>
								+
							</button>
						</div>
					</div>

					<button type='button' onClick={handleClear} style={actionButtonStyle}>
						Clear Canvas
					</button>
					<button
						type='button'
						onClick={() => setShowOpenDialog(true)}
						style={actionButtonStyle}
					>
						📂 Open PNG
					</button>
					<button
						type='button'
						onClick={handleDownload}
						style={actionButtonStyle}
					>
						Save PNG
					</button>
				</div>
			</div>

			{/* Main Canvas Area */}
			<div style={canvasAreaStyle}>
				<div style={canvasSectionStyle}>
					<div
						style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
					>
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
								border: `3px solid ${COLORS.BORDER_SHADOW}`,
								borderTopColor: COLORS.BORDER_SHADOW,
								borderLeftColor: COLORS.BORDER_SHADOW,
								borderBottomColor: COLORS.BORDER_LIGHT,
								borderRightColor: COLORS.BORDER_LIGHT,
								boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.1)',
							}}
						/>
					</div>
				</div>

				{/* Enhanced Status Bar */}
				<div style={statusBarStyle}>
					<span>Tool: {tool === 'brush' ? 'Brush' : 'Eraser'}</span>
					<span>Size: {brushSizeState}px</span>
					<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
						Color:
						<div
							style={{
								width: 16,
								height: 16,
								backgroundColor:
									tool === 'eraser' ? effectiveBackground : currentColor,
								border: `1px solid ${COLORS.BORDER_DARK}`,
								borderRadius: 2,
							}}
						/>
						{tool === 'eraser' ? 'Background' : currentColor}
					</span>
					<span>
						Canvas: {width} × {height}
					</span>
				</div>
			</div>

			{/* Open Image Dialog */}
			{showOpenDialog && (
				<div style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 1000,
				}}>
					<div style={{
						backgroundColor: COLORS.WIN_GRAY,
						border: `3px solid ${COLORS.BORDER_LIGHT}`,
						borderTopColor: COLORS.BORDER_LIGHT,
						borderLeftColor: COLORS.BORDER_LIGHT,
						borderBottomColor: COLORS.BORDER_SHADOW,
						borderRightColor: COLORS.BORDER_SHADOW,
						padding: 16,
						minWidth: 300,
						maxWidth: 500,
						maxHeight: 400,
						overflow: 'auto',
					}}>
						<h3 style={{ 
							margin: '0 0 16px 0', 
							color: COLORS.TEXT_BLACK,
							fontSize: 14,
							fontWeight: 'bold'
						}}>
							📂 Open PNG Image
						</h3>
						
						<div style={{ marginBottom: 16 }}>
							{getAllPngFiles().length === 0 ? (
								<p style={{ 
									color: COLORS.TEXT_BLACK, 
									fontSize: 12,
									margin: 0,
									fontStyle: 'italic'
								}}>
									No PNG files found. Take a screenshot with the Camera app first!
								</p>
							) : (
								<div>
									<p style={{ 
										color: COLORS.TEXT_BLACK, 
										fontSize: 12,
										margin: '0 0 8px 0'
									}}>
										Select an image to open:
									</p>
									{getAllPngFiles().map((file, index) => (
										<div
											key={file.path}
											style={{
												display: 'flex',
												alignItems: 'center',
												padding: 8,
												backgroundColor: COLORS.WIN_WHITE,
												border: `1px solid ${COLORS.BORDER_SHADOW}`,
												marginBottom: 4,
												cursor: 'pointer',
												fontSize: 12,
											}}
											onClick={() => handleOpenImage(file.imageData)}
											onMouseOver={(e) => {
												e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
												e.currentTarget.style.color = COLORS.WIN_WHITE;
											}}
											onMouseOut={(e) => {
												e.currentTarget.style.backgroundColor = COLORS.WIN_WHITE;
												e.currentTarget.style.color = COLORS.TEXT_BLACK;
											}}
										>
											🖼️ {file.name}
										</div>
									))}
								</div>
							)}
						</div>
						
						<div style={{ textAlign: 'right' }}>
							<button
								onClick={() => setShowOpenDialog(false)}
								style={{
									...actionButtonStyle,
									fontSize: 12,
									padding: '6px 12px',
								}}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
