export type SubmenuType = 'programs' | 'documents' | 'settings';

export interface SubmenuProps {
  type: SubmenuType;
  onLaunchApp: (appType: string, content?: any) => void;
  onShowSettings: () => void;
  onClose: () => void;
}

export interface StartMenuItemProps {
  icon: string;
  text: string;
  hasArrow: boolean;
  onHover: () => void;
  onClick: () => void;
}