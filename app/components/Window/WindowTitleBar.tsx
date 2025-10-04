'use client';

import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { COLORS, WINDOW_DEFAULTS } from '@/app/lib/constants';

interface WindowTitleBarProps {
  title: string;
  icon?: string;
  isFocused: boolean;
  onMouseDown: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const buttonStyle: CSSProperties = {
  width: 24,
  height: WINDOW_DEFAULTS.TITLE_BAR_HEIGHT - 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 4,
  fontSize: 12,
  fontWeight: 700,
  backgroundColor: COLORS.WIN_GRAY,
  color: COLORS.TEXT_BLACK,
  borderTop: `1px solid ${COLORS.BORDER_LIGHT}`,
  borderLeft: `1px solid ${COLORS.BORDER_HIGHLIGHT}`,
  borderBottom: `1px solid ${COLORS.BORDER_DARK}`,
  borderRight: `1px solid ${COLORS.BORDER_SHADOW}`,
  lineHeight: 1,
  cursor: 'pointer',
};

function handleButtonMouseDown(event: ReactMouseEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

function handleButtonClick(
  event: ReactMouseEvent<HTMLButtonElement>,
  action?: () => void,
) {
  event.stopPropagation();
  action?.();
}

export default function WindowTitleBar({
  title,
  icon,
  isFocused,
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
}: WindowTitleBarProps) {
  const titleBarStyle: CSSProperties = {
    backgroundColor: isFocused ? COLORS.WIN_BLUE : COLORS.BORDER_SHADOW,
    color: COLORS.TEXT_WHITE,
    height: WINDOW_DEFAULTS.TITLE_BAR_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 6px',
    userSelect: 'none',
    cursor: 'move',
  };

  return (
    <div style={titleBarStyle} onMouseDown={onMouseDown} role="presentation">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          overflow: 'hidden',
        }}
      >
        {icon ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              backgroundColor: COLORS.WIN_GRAY,
              color: COLORS.TEXT_BLACK,
              border: `1px solid ${COLORS.BORDER_SHADOW}`,
              fontSize: 10,
              fontWeight: 700,
            }}
            aria-hidden
          >
            {icon.slice(0, 2).toUpperCase()}
          </span>
        ) : null}
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {title}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {onMinimize ? (
          <button
            type="button"
            style={buttonStyle}
            onMouseDown={handleButtonMouseDown}
            onClick={(event) => handleButtonClick(event, onMinimize)}
            aria-label="Minimize window"
          >
            _
          </button>
        ) : null}
        {onMaximize ? (
          <button
            type="button"
            style={buttonStyle}
            onMouseDown={handleButtonMouseDown}
            onClick={(event) => handleButtonClick(event, onMaximize)}
            aria-label="Maximize window"
          >
            []
          </button>
        ) : null}
        <button
          type="button"
          style={{
            ...buttonStyle,
            marginLeft: 4,
            color: COLORS.TEXT_BLACK,
          }}
          onMouseDown={handleButtonMouseDown}
          onClick={(event) => handleButtonClick(event, onClose)}
          aria-label="Close window"
        >
          X
        </button>
      </div>
    </div>
  );
}
