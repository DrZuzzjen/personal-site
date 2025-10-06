'use client';

import type { CSSProperties, MouseEvent } from 'react';
import { COLORS } from '@/app/lib/constants';
import type { Window as WindowType } from '@/app/lib/types';

interface TaskbarButtonProps {
  window: WindowType;
  isActive: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

const baseButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  minWidth: 120,
  maxWidth: 200,
  padding: '4px 8px',
  margin: '0 4px',
  fontSize: 12,
  backgroundColor: COLORS.WIN_GRAY,
  color: COLORS.TEXT_BLACK,
  cursor: 'pointer',
  border: 'none',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
};

const raisedBorderStyle: CSSProperties = {
  borderTop: `2px solid ${COLORS.BORDER_LIGHT}`,
  borderLeft: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
  borderBottom: `2px solid ${COLORS.BORDER_SHADOW}`,
  borderRight: `2px solid ${COLORS.BORDER_DARK}`,
};

const sunkenBorderStyle: CSSProperties = {
  borderTop: `2px solid ${COLORS.BORDER_SHADOW}`,
  borderLeft: `2px solid ${COLORS.BORDER_DARK}`,
  borderBottom: `2px solid ${COLORS.BORDER_LIGHT}`,
  borderRight: `2px solid ${COLORS.BORDER_HIGHLIGHT}`,
};

const iconStyle: CSSProperties = {
  width: 16,
  height: 16,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: COLORS.WIN_GRAY,
  color: COLORS.TEXT_BLACK,
  border: `1px solid ${COLORS.BORDER_SHADOW}`,
  fontSize: 10,
  fontWeight: 700,
};

export function TaskbarButton({ window, isActive, onClick }: TaskbarButtonProps) {
  const { title, icon, isFlashing } = window;

  const buttonStyle: CSSProperties = {
    ...baseButtonStyle,
    ...(isActive ? sunkenBorderStyle : raisedBorderStyle),
    // Keep red background for debugging
    ...(isFlashing && !isActive ? { backgroundColor: 'red' } : {}),
  };

  return (
    <button
      type="button"
      style={buttonStyle}
      className={isFlashing && !isActive ? 'taskbar-flashing' : ''}
      onClick={onClick}
      aria-pressed={isActive}
      title={title}
    >
      {icon ? (
        <span style={iconStyle} aria-hidden>
          {icon.slice(0, 2).toUpperCase()}
        </span>
      ) : null}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          textAlign: 'left',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </span>
    </button>
  );
}

export default TaskbarButton;
