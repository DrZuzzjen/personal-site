/**
 * Device Detection Utility
 * Detects mobile device type, OS, and version for enhanced mobile terminal experience
 */

export interface DeviceInfo {
  platform: 'iOS' | 'Android' | 'Unknown';
  version: string;
  type: 'iPhone' | 'iPad' | 'Android' | 'Mobile' | 'Desktop';
  isMobile: boolean;
}

/**
 * Detect device information from user agent
 */
export function getDeviceInfo(): DeviceInfo {
  // Server-side fallback
  if (typeof window === 'undefined') {
    return {
      platform: 'Unknown',
      version: 'Unknown',
      type: 'Desktop',
      isMobile: false,
    };
  }

  const ua = navigator.userAgent;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(ua)) {
    const versionMatch = ua.match(/OS (\d+)_(\d+)/);
    const version = versionMatch ? `${versionMatch[1]}.${versionMatch[2]}` : 'Unknown';

    return {
      platform: 'iOS',
      version,
      type: /iPad/.test(ua) ? 'iPad' : 'iPhone',
      isMobile: true,
    };
  }

  // Android detection
  if (/Android/.test(ua)) {
    const versionMatch = ua.match(/Android (\d+\.?\d*)/);
    const version = versionMatch ? versionMatch[1] : 'Unknown';

    return {
      platform: 'Android',
      version,
      type: 'Android',
      isMobile: true,
    };
  }

  // Desktop/Unknown
  return {
    platform: 'Unknown',
    version: 'Unknown',
    type: 'Desktop',
    isMobile: false,
  };
}

/**
 * Get a human-readable device description
 */
export function getDeviceDescription(info: DeviceInfo): string {
  if (info.platform === 'iOS') {
    return `${info.type} (iOS ${info.version})`;
  }

  if (info.platform === 'Android') {
    return `Android ${info.version}`;
  }

  return 'Mobile Device';
}

/**
 * Check if user is on mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return getDeviceInfo().isMobile;
}
