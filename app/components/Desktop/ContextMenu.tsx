'use client';

import React, { useState, useEffect } from 'react';
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
	const [showSubmenu, setShowSubmenu] = useState<string | null>(null);
	const [submenuTimer, setSubmenuTimer] = useState<NodeJS.Timeout | null>(null);

	const menuItems = [
		{
			label: 'New',
			submenu: [
				{ label: '📁 Folder', action: onNewFolder },
				{ label: '📄 Text Document', action: onNewTextFile },
			],
		},
		{ label: 'Refresh', action: onRefresh },
		{ label: 'Properties', action: onProperties },
	];

	const handleMenuClick = (action: () => void) => {
		action();
		onClose();
	};

	const handleSubmenuHover = (label: string) => {
		// Clear existing timer
		if (submenuTimer) {
			clearTimeout(submenuTimer);
		}

		// Set new timer for submenu delay (150ms for authentic feel)
		const timer = setTimeout(() => {
			setShowSubmenu(label);
		}, 150);
		
		setSubmenuTimer(timer);
	};

	const handleSubmenuLeave = () => {
		// Clear timer and hide submenu
		if (submenuTimer) {
			clearTimeout(submenuTimer);
		}
		setSubmenuTimer(null);
		setShowSubmenu(null);
	};

	// Clean up timer on unmount
	useEffect(() => {
		return () => {
			if (submenuTimer) {
				clearTimeout(submenuTimer);
			}
		};
	}, [submenuTimer]);

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
					<div key={index} style={{ position: 'relative' }}>
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
									handleSubmenuHover(item.label);
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
									e.currentTarget.style.color = COLORS.TEXT_BLACK;
									// Don't hide submenu immediately - let submenu handle it
								}}
							>
								{item.label}
								<span style={{ float: 'right' }}>▶</span>
								
								{/* Submenu */}
								{showSubmenu === item.label && (
									<div
										style={{
											position: 'absolute',
											left: '100%',
											top: 0,
											marginLeft: 1,
											backgroundColor: COLORS.WIN_GRAY,
											border: `2px solid ${COLORS.BORDER_SHADOW}`,
											borderTopColor: COLORS.BORDER_LIGHT,
											borderLeftColor: COLORS.BORDER_LIGHT,
											borderRightColor: COLORS.BORDER_DARK,
											borderBottomColor: COLORS.BORDER_DARK,
											minWidth: 140,
											zIndex: 10003,
											boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
										}}
										onMouseEnter={() => {
											// Keep submenu open when hovering over it
											if (submenuTimer) {
												clearTimeout(submenuTimer);
												setSubmenuTimer(null);
											}
										}}
										onMouseLeave={handleSubmenuLeave}
									>
										{item.submenu.map((subItem, subIndex) => (
											<div key={subIndex}>
												<div
													style={{
														padding: '4px 16px 4px 8px',
														cursor: 'pointer',
														color: COLORS.TEXT_BLACK,
													}}
													onClick={() => handleMenuClick(subItem.action)}
													onMouseEnter={(e) => {
														e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
														e.currentTarget.style.color = COLORS.TEXT_WHITE;
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.backgroundColor = 'transparent';
														e.currentTarget.style.color = COLORS.TEXT_BLACK;
													}}
												>
													{subItem.label}
												</div>
												{subIndex < item.submenu!.length - 1 && (
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
								)}
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
