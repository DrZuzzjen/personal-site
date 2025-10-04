'use client';

import React from 'react';
import { COLORS } from '@/app/lib/constants';

interface ContextMenuProps {
	x: number;
	y: number;
	onClose: () => void;
	onNewFolder: () => void;
	onNewTextFile: () => void;
	onRefresh: () => void;
	onProperties: () => void;
}

export default function ContextMenu({
	x,
	y,
	onClose,
	onNewFolder,
	onNewTextFile,
	onRefresh,
	onProperties,
}: ContextMenuProps) {
	const menuItems = [
		{
			label: 'New',
			submenu: [
				{ label: 'Folder', action: onNewFolder },
				{ label: 'Text File', action: onNewTextFile },
			],
		},
		{ label: 'Refresh', action: onRefresh },
		{ label: 'Properties', action: onProperties },
	];

	const handleMenuClick = (action: () => void) => {
		action();
		onClose();
	};

	return (
		<>
			{/* Invisible overlay to catch clicks outside menu */}
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 10001,
				}}
				onClick={onClose}
				onContextMenu={(e) => {
					e.preventDefault();
					onClose();
				}}
			/>

			{/* Context menu */}
			<div
				style={{
					position: 'fixed',
					left: x,
					top: y,
					backgroundColor: COLORS.WIN_GRAY,
					border: `2px solid ${COLORS.BORDER_SHADOW}`,
					borderTopColor: COLORS.BORDER_LIGHT,
					borderLeftColor: COLORS.BORDER_LIGHT,
					borderRightColor: COLORS.BORDER_DARK,
					borderBottomColor: COLORS.BORDER_DARK,
					minWidth: 120,
					zIndex: 10002,
					fontFamily: 'var(--font-sans)',
					fontSize: '11px',
					boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
				}}
			>
				{menuItems.map((item, index) => (
					<div key={index}>
						{item.submenu ? (
							// Menu item with submenu
							<div
								style={{
									padding: '4px 16px 4px 8px',
									cursor: 'pointer',
									color: COLORS.TEXT_BLACK,
									position: 'relative',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
									e.currentTarget.style.color = COLORS.TEXT_WHITE;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
									e.currentTarget.style.color = COLORS.TEXT_BLACK;
								}}
							>
								{item.label}
								<span style={{ float: 'right' }}>▶</span>
								{/* Submenu - could be implemented later for full functionality */}
							</div>
						) : (
							// Simple menu item
							<div
								style={{
									padding: '4px 16px 4px 8px',
									cursor: 'pointer',
									color: COLORS.TEXT_BLACK,
								}}
								onClick={() => item.action && handleMenuClick(item.action)}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
									e.currentTarget.style.color = COLORS.TEXT_WHITE;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
									e.currentTarget.style.color = COLORS.TEXT_BLACK;
								}}
							>
								{item.label}
							</div>
						)}
						{index < menuItems.length - 1 && (
							<div
								style={{
									height: 1,
									backgroundColor: COLORS.BORDER_SHADOW,
									margin: '2px 4px',
								}}
							/>
						)}
					</div>
				))}
			</div>
		</>
	);
}
