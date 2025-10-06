'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ChangeEvent, FocusEvent } from 'react';
import { COLORS } from '@/app/lib/constants';

interface BrowserProps {
	initialUrl?: string | null;
	homeUrl?: string | null;
}

const DEFAULT_HOME = 'https://www.infobae.com/';
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const THROBBER_FRAMES = ['◐', '◓', '◑', '◒'];

function sanitizeUrl(candidate?: string | null): string | null {
	if (typeof candidate !== 'string') {
		return null;
	}

	const trimmed = candidate.trim();
	if (!trimmed) {
		return null;
	}

	try {
		const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)
			? trimmed
			: `https://${trimmed}`;
		const url = new URL(withProtocol);
		if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
			return null;
		}
		return url.toString();
	} catch {
		return null;
	}
}

function toolbarButtonStyle(disabled: boolean): CSSProperties {
	return {
		minWidth: 72,
		padding: '4px 10px',
		fontSize: 12,
		fontWeight: 600,
		color: COLORS.TEXT_BLACK,
		backgroundColor: disabled ? '#d9d5cc' : '#ede9df',
		borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
		borderLeft: `2px solid ${COLORS.BORDER_LIGHT}`,
		borderRight: `2px solid ${COLORS.BORDER_SHADOW}`,
		borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
		cursor: disabled ? 'default' : 'pointer',
		opacity: disabled ? 0.55 : 1,
		boxShadow: disabled ? 'none' : '1px 1px 0 rgba(0, 0, 0, 0.25)',
		fontFamily: 'var(--font-sans, "MS Sans Serif", sans-serif)',
	};
}

export default function Browser({ initialUrl, homeUrl }: BrowserProps) {
	const normalizedHome = useMemo(
		() => sanitizeUrl(homeUrl) ?? DEFAULT_HOME,
		[homeUrl]
	);
	const normalizedInitial = useMemo(
		() => sanitizeUrl(initialUrl) ?? normalizedHome,
		[initialUrl, normalizedHome]
	);

	const [history, setHistory] = useState<string[]>([normalizedInitial]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const [addressValue, setAddressValue] = useState(normalizedInitial);
	const [reloadToken, setReloadToken] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [statusMessage, setStatusMessage] = useState(`Opening ${normalizedInitial}`);
	const [throbberFrame, setThrobberFrame] = useState(0);

	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	useEffect(() => {
		setHistory([normalizedInitial]);
		setHistoryIndex(0);
		setAddressValue(normalizedInitial);
		setReloadToken((token) => token + 1);
		setIsLoading(true);
		setStatusMessage(`Opening ${normalizedInitial}`);
	}, [normalizedInitial]);

	useEffect(() => {
		if (!isLoading) {
			setThrobberFrame(0);
			return;
		}

		const timer = window.setInterval(() => {
			setThrobberFrame((frame) => (frame + 1) % THROBBER_FRAMES.length);
		}, 160);

		return () => {
			window.clearInterval(timer);
		};
	}, [isLoading]);

	const currentUrl = history[historyIndex] ?? normalizedInitial;
	const hostname = useMemo(() => {
		try {
			return new URL(currentUrl).hostname;
		} catch {
			return currentUrl;
		}
	}, [currentUrl]);
	const isSecure = useMemo(() => {
		try {
			return new URL(currentUrl).protocol === 'https:';
		} catch {
			return false;
		}
	}, [currentUrl]);

	const attemptNavigation = useCallback(
		(rawUrl: string) => {
			const sanitized = sanitizeUrl(rawUrl);
			if (!sanitized) {
				setStatusMessage('Unsupported URL. Please use http:// or https://');
				return;
			}

			setHistory((prevHistory) => {
				const trimmed = prevHistory.slice(0, historyIndex + 1);
				const nextHistory = [...trimmed, sanitized];
				setHistoryIndex(nextHistory.length - 1);
				return nextHistory;
			});

			setAddressValue(sanitized);
			setIsLoading(true);
			setStatusMessage(`Opening ${sanitized}`);
		},
		[historyIndex]
	);

	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			attemptNavigation(addressValue);
		},
		[attemptNavigation, addressValue]
	);

	const handleBack = useCallback(() => {
		if (historyIndex === 0) {
			return;
		}

		const nextIndex = historyIndex - 1;
		const target = history[nextIndex];
		setHistoryIndex(nextIndex);
		if (target) {
			setAddressValue(target);
			setIsLoading(true);
			setStatusMessage(`Opening ${target}`);
		}
	}, [historyIndex, history]);

	const handleForward = useCallback(() => {
		if (historyIndex >= history.length - 1) {
			return;
		}

		const nextIndex = historyIndex + 1;
		const target = history[nextIndex];
		setHistoryIndex(nextIndex);
		if (target) {
			setAddressValue(target);
			setIsLoading(true);
			setStatusMessage(`Opening ${target}`);
		}
	}, [historyIndex, history]);

	const handleRefresh = useCallback(() => {
		setIsLoading(true);
		setStatusMessage(`Refreshing ${currentUrl}`);
		setReloadToken((token) => token + 1);
	}, [currentUrl]);

	const handleStop = useCallback(() => {
		const frame = iframeRef.current;
		if (frame?.contentWindow) {
			try {
				frame.contentWindow.stop();
			} catch {
				// Cross-origin frames may block stop(); ignore.
			}
		}
		setIsLoading(false);
		setStatusMessage('Navigation canceled');
	}, []);

	const handleHome = useCallback(() => {
		attemptNavigation(normalizedHome);
	}, [attemptNavigation, normalizedHome]);

	const handleGo = useCallback(() => {
		attemptNavigation(addressValue);
	}, [attemptNavigation, addressValue]);

	const handleAddressChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setAddressValue(event.target.value);
		},
		[]
	);

	const handleAddressFocus = useCallback((event: FocusEvent<HTMLInputElement>) => {
		event.target.select();
	}, []);

	const handleFrameLoad = useCallback(() => {
		setIsLoading(false);
		try {
			const url = new URL(currentUrl);
			setStatusMessage(`Loaded ${url.hostname}`);
		} catch {
			setStatusMessage('Done');
		}
	}, [currentUrl]);

	const canGoBack = historyIndex > 0;
	const canGoForward = historyIndex < history.length - 1;
	const throbberSymbol = isLoading ? THROBBER_FRAMES[throbberFrame] : '🌐';
	const iframeKey = `${currentUrl}|${reloadToken}`;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				backgroundColor: '#d4d0c8',
				border: `1px solid ${COLORS.BORDER_SHADOW}`,
				boxShadow: 'inset 0 0 0 1px #ffffff',
				fontFamily: 'var(--font-sans, "MS Sans Serif", sans-serif)',
				color: COLORS.TEXT_BLACK,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					padding: '6px 8px',
					backgroundColor: '#d4d0c8',
					borderBottom: `1px solid ${COLORS.BORDER_SHADOW}`,
				}}
			>
				<button
					type='button'
					disabled={!canGoBack}
					onClick={handleBack}
					style={toolbarButtonStyle(!canGoBack)}
				>
					◀ Back
				</button>
				<button
					type='button'
					disabled={!canGoForward}
					onClick={handleForward}
					style={toolbarButtonStyle(!canGoForward)}
				>
					Forward ▶
				</button>
				<button
					type='button'
					onClick={handleStop}
					style={toolbarButtonStyle(!isLoading)}
					disabled={!isLoading}
				>
					■ Stop
				</button>
				<button
					type='button'
					onClick={handleRefresh}
					style={toolbarButtonStyle(false)}
				>
					⟳ Refresh
				</button>
				<button
					type='button'
					onClick={handleHome}
					style={toolbarButtonStyle(false)}
				>
					⌂ Home
				</button>
			</div>

			<form
				onSubmit={handleSubmit}
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					padding: '6px 8px',
					backgroundColor: '#e5e1d8',
					borderBottom: `1px solid ${COLORS.BORDER_SHADOW}`,
				}}
			>
				<span style={{ fontSize: 12, fontWeight: 600 }}>Address</span>
				<input
					type='text'
					value={addressValue}
					onChange={handleAddressChange}
					onFocus={handleAddressFocus}
					autoComplete='off'
					spellCheck={false}
					style={{
						flex: 1,
						height: 26,
						padding: '0 8px',
						borderTop: `1px solid ${COLORS.BORDER_LIGHT}`,
						borderLeft: `1px solid ${COLORS.BORDER_LIGHT}`,
						borderRight: `1px solid ${COLORS.BORDER_DARK}`,
						borderBottom: `1px solid ${COLORS.BORDER_DARK}`,
						backgroundColor: COLORS.TEXT_WHITE,
						fontSize: 13,
						fontFamily: 'var(--font-sans, "MS Sans Serif", sans-serif)',
					}}
				/>
				<button
					type='submit'
					onClick={handleGo}
					style={{
						...toolbarButtonStyle(false),
						minWidth: 48,
					}}
				>
					Go
				</button>
			</form>

			<div
				style={{
					flex: 1,
					backgroundColor: COLORS.TEXT_WHITE,
					borderTop: `1px solid ${COLORS.BORDER_LIGHT}`,
					borderLeft: `1px solid ${COLORS.BORDER_LIGHT}`,
					borderRight: `1px solid ${COLORS.BORDER_DARK}`,
					borderBottom: `1px solid ${COLORS.BORDER_DARK}`,
					overflow: 'hidden',
				}}
			>
				<iframe
					key={iframeKey}
					ref={iframeRef}
					src={currentUrl}
					title='Microsoft Explorer'
					style={{
						width: '100%',
						height: '100%',
						border: 'none',
					}}
					onLoad={handleFrameLoad}
					allow='accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; camera; midi; payment; usb'
					allowFullScreen
				/>
			</div>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 12,
					padding: '4px 8px',
					backgroundColor: '#d9d5cc',
					borderTop: `1px solid ${COLORS.BORDER_SHADOW}`,
					fontSize: 12,
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<span style={{ fontSize: 14 }}>{throbberSymbol}</span>
					<span style={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
						{statusMessage}
					</span>
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<span>{isSecure ? '🔒 Secure' : '⚠️ Not secure'}</span>
					<span style={{ fontWeight: 600 }}>{hostname}</span>
				</div>
			</div>
		</div>
	);
}
