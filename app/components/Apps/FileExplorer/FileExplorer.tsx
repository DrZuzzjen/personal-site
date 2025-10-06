'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFileSystemContext } from '@/app/lib/FileSystemContext';
import { useWindowContext } from '@/app/lib/WindowContext';
import { COLORS } from '@/app/lib/constants';
import type { FileSystemItem } from '@/app/lib/types';

interface FileExplorerProps {
	initialPath?: string | null;
}

const DEFAULT_START_PATH = '/My Computer';

function resolveInitialPath(path?: string | null) {
	return path === undefined ? DEFAULT_START_PATH : path;
}

function getParentPath(path: string | null): string | null {
	if (!path) {
		return null;
	}

	const segments = path.split('/').filter(Boolean);
	if (segments.length <= 1) {
		return null;
	}

	segments.pop();
	return '/' + segments.join('/');
}

function sortItems(items: FileSystemItem[]) {
	return [...items].sort((a, b) => {
		if (a.type === b.type) {
			return a.name.localeCompare(b.name);
		}
		return a.type === 'folder' ? -1 : 1;
	});
}

function buildIconLabel(item: FileSystemItem) {
	if (item.type === 'folder') {
		return 'DIR';
	}

	if (item.extension) {
		return item.extension.toUpperCase().slice(0, 3);
	}

	return 'FILE';
}

export default function FileExplorer({
	initialPath,
	onProtectedDelete,
}: FileExplorerProps & {
	onProtectedDelete?: (filePath: string, fileName: string) => void;
} = {}) {
	const { rootItems, getItemByPath, deleteItem, resolvePath } = useFileSystemContext();
	const { openWindow } = useWindowContext();

	const [currentPath, setCurrentPath] = useState<string | null>(() =>
		resolveInitialPath(initialPath)
	);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		item: FileSystemItem;
	} | null>(null);

	useEffect(() => {
		setCurrentPath(resolveInitialPath(initialPath));
	}, [initialPath]);

	useEffect(() => {
		setSelectedId(null);
	}, [currentPath]);

	const currentFolder = useMemo(() => {
		if (!currentPath) {
			return null;
		}
		return getItemByPath(currentPath);
	}, [currentPath, getItemByPath]);

	const itemsInView = useMemo(() => {
		if (currentFolder && currentFolder.children) {
			return sortItems(currentFolder.children);
		}

		if (!currentPath) {
			return sortItems(rootItems);
		}

		return [] as FileSystemItem[];
	}, [currentFolder, currentPath, rootItems]);

	const parentPath = useMemo(() => getParentPath(currentPath), [currentPath]);

	const handleOpenFile = (item: FileSystemItem) => {
		if (item.type !== 'file') {
			return;
		}

		openWindow({
			title: `${item.name} - Notepad`,
			appType: 'notepad',
			position: { x: 180, y: 140 },
			size: { width: 460, height: 320 },
			icon: 'NP',
			content: {
				filePath: item.path,
				fileName: item.name,
				body: item.content ?? '',
				readOnly: true,
			},
		});
	};

	const handleDeleteItem = (item: FileSystemItem) => {
		if (item.isProtected) {
			// Trigger easter egg for protected items
			if (onProtectedDelete) {
				onProtectedDelete(item.path, item.name);
			}
			return;
		}

		// Delete non-protected items normally
		const success = deleteItem(item.path);
		if (!success) {
			// This shouldn't happen for non-protected items, but just in case
			if (onProtectedDelete) {
				onProtectedDelete(item.path, item.name);
			}
		}
	};

	const handleContextMenu = (event: React.MouseEvent, item: FileSystemItem) => {
		event.preventDefault();
		setContextMenu({
			x: event.clientX,
			y: event.clientY,
			item,
		});
	};

	const handleNavigate = (item: FileSystemItem) => {
		if (item.type === 'folder') {
			// Resolve shortcuts (e.g., '/My Computer/C:' -> '/C:/')
			const resolvedPath = resolvePath(item.path);
			setCurrentPath(resolvedPath);
			return;
		}

		handleOpenFile(item);
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				backgroundColor: COLORS.WIN_GRAY,
				color: COLORS.TEXT_BLACK,
				fontFamily: 'var(--font-sans)',
				borderTop: '2px solid ' + COLORS.BORDER_LIGHT,
				borderLeft: '2px solid ' + COLORS.BORDER_HIGHLIGHT,
				borderBottom: '2px solid ' + COLORS.BORDER_SHADOW,
				borderRight: '2px solid ' + COLORS.BORDER_DARK,
			}}
		>
			<div
				style={{
					display: 'flex',
					gap: 16,
					padding: '6px 8px',
					borderBottom: '1px solid ' + COLORS.BORDER_SHADOW,
					fontSize: 12,
				}}
			>
				<strong>File</strong>
				<strong>Edit</strong>
				<strong>View</strong>
				<strong>Help</strong>
			</div>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					padding: '6px 8px',
					borderBottom: '1px solid ' + COLORS.BORDER_SHADOW,
					fontSize: 12,
				}}
			>
				<button
					type='button'
					onClick={() => {
						if (!currentPath) {
							return;
						}
						setCurrentPath(parentPath);
					}}
					disabled={!parentPath}
					style={{
						minWidth: 32,
						height: 24,
						borderTop: '2px solid ' + COLORS.BORDER_LIGHT,
						borderLeft: '2px solid ' + COLORS.BORDER_HIGHLIGHT,
						borderBottom: '2px solid ' + COLORS.BORDER_SHADOW,
						borderRight: '2px solid ' + COLORS.BORDER_DARK,
						backgroundColor: COLORS.WIN_GRAY,
						color: COLORS.TEXT_BLACK,
						cursor: parentPath ? 'pointer' : 'default',
					}}
					aria-label='Go up one level'
				>
					Up
				</button>
				<span>Path:</span>
				<input
					value={currentPath ?? 'Root'}
					readOnly
					style={{
						flex: 1,
						height: 22,
						padding: '0 6px',
						border: '1px solid ' + COLORS.BORDER_SHADOW,
						backgroundColor: COLORS.WIN_WHITE,
					}}
				/>
			</div>

			<div
				style={{
					flex: 1,
					overflow: 'auto',
					padding: '4px 8px',
					backgroundColor: COLORS.WIN_WHITE,
				}}
			>
				{itemsInView.length === 0 ? (
					<div style={{ fontSize: 12 }}>This folder is empty.</div>
				) : (
					<ul
						style={{
							listStyle: 'none',
							margin: 0,
							padding: 0,
						}}
					>
						{itemsInView.map((item) => {
							const isSelected = selectedId === item.id;
							return (
								<li
									key={item.id}
									draggable={item.type === 'file'} // Only files can be dragged for now
									onClick={() => setSelectedId(item.id)}
									onDoubleClick={() => handleNavigate(item)}
									onContextMenu={(e) => handleContextMenu(e, item)}
									onDragStart={(e) => {
										if (item.type === 'file') {
											e.dataTransfer.setData(
												'application/file',
												JSON.stringify({
													id: item.id,
													name: item.name,
													type: item.type,
													path: item.path,
													extension: item.extension,
												})
											);
											e.dataTransfer.effectAllowed = 'copy';
										}
									}}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										padding: '4px 6px',
										border: isSelected
											? '1px dotted ' + COLORS.WIN_BLUE_LIGHT
											: '1px solid transparent',
										backgroundColor: isSelected ? '#dbe8ff' : 'transparent',
										cursor: item.type === 'file' ? 'grab' : 'default',
										userSelect: 'none',
										fontSize: 12,
									}}
									onMouseDown={(e) => {
										if (item.type === 'file') {
											e.currentTarget.style.cursor = 'grabbing';
										}
									}}
									onMouseUp={(e) => {
										if (item.type === 'file') {
											e.currentTarget.style.cursor = 'grab';
										}
									}}
								>
									<span
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											justifyContent: 'center',
											width: 20,
											height: 20,
											border: '1px solid ' + COLORS.BORDER_SHADOW,
											backgroundColor: COLORS.WIN_GRAY,
											fontWeight: 700,
											fontSize: 10,
										}}
										aria-hidden
									>
										{buildIconLabel(item)}
									</span>
									<span>{item.name}</span>
								</li>
							);
						})}
					</ul>
				)}
			</div>

			{/* Context Menu */}
			{contextMenu && (
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
						onClick={() => setContextMenu(null)}
						onContextMenu={(e) => {
							e.preventDefault();
							setContextMenu(null);
						}}
					/>

					{/* Context menu */}
					<div
						style={{
							position: 'fixed',
							left: contextMenu.x,
							top: contextMenu.y,
							backgroundColor: COLORS.WIN_GRAY,
							border: `2px outset ${COLORS.WIN_GRAY}`,
							boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
							zIndex: 10002,
							minWidth: '120px',
							fontFamily: 'MS Sans Serif, sans-serif',
							fontSize: '11px',
						}}
					>
						<div
							style={{
								padding: '4px 12px',
								cursor: 'pointer',
								backgroundColor: 'transparent',
							}}
							onClick={() => {
								handleNavigate(contextMenu.item);
								setContextMenu(null);
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
								e.currentTarget.style.color = COLORS.WIN_WHITE;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'transparent';
								e.currentTarget.style.color = COLORS.TEXT_BLACK;
							}}
						>
							Open
						</div>
						<div
							style={{
								padding: '4px 12px',
								cursor: 'pointer',
								backgroundColor: 'transparent',
								borderTop: '1px solid ' + COLORS.BORDER_SHADOW,
							}}
							onClick={() => {
								handleDeleteItem(contextMenu.item);
								setContextMenu(null);
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = COLORS.WIN_BLUE;
								e.currentTarget.style.color = COLORS.WIN_WHITE;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'transparent';
								e.currentTarget.style.color = COLORS.TEXT_BLACK;
							}}
						>
							Delete
						</div>
					</div>
				</>
			)}
		</div>
	);
}
