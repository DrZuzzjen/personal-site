'use client';

import { useState, useEffect, useRef } from 'react';
import { COLORS } from '@/app/lib/constants';
import StartMenuItem from './StartMenuItem';
import Submenu from './Submenu';
import type { SubmenuType } from './types';

interface StartMenuProps {
	isOpen: boolean;
	onClose: () => void;
	onLaunchApp: (appType: string, content?: any) => void;
	onRestart: () => void;
	onShutDown: () => void;
	onShowSettings: () => void;
	onShowFind: () => void;
	onShowHelp: () => void;
}

export default function StartMenu({
	isOpen,
	onClose,
	onLaunchApp,
	onRestart,
	onShutDown,
	onShowSettings,
	onShowFind,
	onShowHelp,
}: StartMenuProps) {
	const [activeSubmenu, setActiveSubmenu] = useState<SubmenuType | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	// Close menu when clicking outside
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
				setActiveSubmenu(null);
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
				setActiveSubmenu(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const handleSubmenuHover = (submenu: SubmenuType | null) => {
		setActiveSubmenu(submenu);
	};

	const handleItemClick = (action: () => void) => {
		action();
		onClose();
		setActiveSubmenu(null);
	};

	return (
		<div
			ref={menuRef}
			style={{
				position: 'fixed',
				bottom: 36, // Height of taskbar
				left: 8,
				width: 200,
				backgroundColor: COLORS.WIN_GRAY,
				border: `2px solid ${COLORS.BORDER_LIGHT}`,
				borderTopColor: COLORS.BORDER_HIGHLIGHT,
				borderLeftColor: COLORS.BORDER_HIGHLIGHT,
				borderBottomColor: COLORS.BORDER_DARK,
				borderRightColor: COLORS.BORDER_DARK,
				zIndex: 1500,
				fontFamily: 'MS Sans Serif, sans-serif',
				fontSize: 14,
				boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
			}}
		>
			<StartMenuItem
				icon='📁'
				text='Programs'
				hasArrow={true}
				onHover={() => handleSubmenuHover('programs')}
				onClick={() => {}}
			/>

			<StartMenuItem
				icon='📄'
				text='Documents'
				hasArrow={true}
				onHover={() => handleSubmenuHover('documents')}
				onClick={() => {}}
			/>

			<StartMenuItem
				icon='⚙️'
				text='Settings'
				hasArrow={true}
				onHover={() => handleSubmenuHover('settings')}
				onClick={() => {}}
			/>

			{/* Separator */}
			<div
				style={{
					height: 2,
					margin: '4px 0',
					borderTop: `1px solid ${COLORS.BORDER_SHADOW}`,
					borderBottom: `1px solid ${COLORS.BORDER_HIGHLIGHT}`,
				}}
			/>

			<StartMenuItem
				icon='🔍'
				text='Find...'
				hasArrow={false}
				onHover={() => handleSubmenuHover(null)}
				onClick={() => handleItemClick(onShowFind)}
			/>

			<StartMenuItem
				icon='❓'
				text='Help'
				hasArrow={false}
				onHover={() => handleSubmenuHover(null)}
				onClick={() => handleItemClick(onShowHelp)}
			/>

			{/* Separator */}
			<div
				style={{
					height: 2,
					margin: '4px 0',
					borderTop: `1px solid ${COLORS.BORDER_SHADOW}`,
					borderBottom: `1px solid ${COLORS.BORDER_HIGHLIGHT}`,
				}}
			/>

			<StartMenuItem
				icon='🔄'
				text='Restart Windows...'
				hasArrow={false}
				onHover={() => handleSubmenuHover(null)}
				onClick={() => handleItemClick(onRestart)}
			/>

			<StartMenuItem
				icon='🔌'
				text='Shut Down...'
				hasArrow={false}
				onHover={() => handleSubmenuHover(null)}
				onClick={() => handleItemClick(onShutDown)}
			/>

			{/* Submenus */}
			{activeSubmenu && (
				<Submenu
					type={activeSubmenu}
					onLaunchApp={onLaunchApp}
					onShowSettings={onShowSettings}
					onClose={onClose}
				/>
			)}
		</div>
	);
}
