'use client';

import { useEffect } from 'react';
import { COLORS } from '@/app/lib/constants';

export interface ErrorDialogProps {
	message: string;
	title?: string;
	onClose: () => void;
	visible: boolean;
}

export default function ErrorDialog({
	message,
	title = 'Error',
	onClose,
	visible,
}: ErrorDialogProps) {
	// Handle escape key to close dialog
	useEffect(() => {
		if (!visible) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [visible, onClose]);

	if (!visible) return null;

	return (
		<>
			{/* Modal overlay */}
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100vw',
					height: '100vh',
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					zIndex: 2000,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
				onClick={onClose}
			/>

			{/* Error dialog window */}
			<div
				style={{
					position: 'fixed',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: '400px',
					backgroundColor: COLORS.WIN_GRAY,
					border: `2px outset ${COLORS.WIN_GRAY}`,
					zIndex: 2001,
					fontFamily: 'MS Sans Serif, sans-serif',
					fontSize: '11px',
				}}
			>
				{/* Title bar */}
				<div
					style={{
						backgroundColor: COLORS.WIN_BLUE,
						color: COLORS.WIN_WHITE,
						padding: '4px 8px',
						fontWeight: 'bold',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<span>{title}</span>
					<button
						onClick={onClose}
						style={{
							backgroundColor: COLORS.WIN_GRAY,
							border: `1px outset ${COLORS.WIN_GRAY}`,
							width: '16px',
							height: '14px',
							fontSize: '8px',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						×
					</button>
				</div>

				{/* Dialog content */}
				<div
					style={{
						padding: '16px 20px 20px 20px',
						display: 'flex',
						alignItems: 'flex-start',
						gap: '12px',
					}}
				>
					{/* Warning icon */}
					<div
						style={{
							fontSize: '24px',
							color: '#FFD700',
							textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
							marginTop: '2px',
						}}
					>
						⚠️
					</div>

					{/* Message text */}
					<div
						style={{
							flex: 1,
							lineHeight: 1.4,
							color: COLORS.TEXT_BLACK,
							marginTop: '4px',
						}}
					>
						{message}
					</div>
				</div>

				{/* OK button */}
				<div
					style={{
						padding: '0 20px 16px 20px',
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<button
						onClick={onClose}
						style={{
							backgroundColor: COLORS.WIN_GRAY,
							border: `2px outset ${COLORS.WIN_GRAY}`,
							padding: '4px 20px',
							fontSize: '11px',
							cursor: 'pointer',
							fontFamily: 'MS Sans Serif, sans-serif',
							minWidth: '75px',
						}}
						onMouseDown={(e) => {
							e.currentTarget.style.border = `2px inset ${COLORS.WIN_GRAY}`;
						}}
						onMouseUp={(e) => {
							e.currentTarget.style.border = `2px outset ${COLORS.WIN_GRAY}`;
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.border = `2px outset ${COLORS.WIN_GRAY}`;
						}}
					>
						OK
					</button>
				</div>
			</div>
		</>
	);
}
