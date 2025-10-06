/**
 * CLIENT-SIDE Browser Context Detection
 * NO SENSITIVE DATA - This file is exposed to the browser
 * Personality config is server-side only in personality.server.ts
 */

// Browser context detection helpers
export interface BrowserContext {
  language: string;
  languageCode: string; // "es", "en", "fr", etc.
  timezone: string;
  city: string | null; // Extracted from timezone
  isReturning: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  isMobile: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenWidth: number;
}

export function getBrowserContext(): BrowserContext {
  const now = new Date();
  const hour = now.getHours();

  let timeOfDay: BrowserContext['timeOfDay'];
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';

  // Detect mobile/tablet/desktop
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const deviceType: BrowserContext['deviceType'] =
    isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  // Extract language code (es-ES → es)
  const language = navigator.language || 'en';
  const languageCode = language.split('-')[0];

  // Extract city from timezone (Europe/Madrid → Madrid, America/New_York → New York)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const city = timezone.split('/').pop()?.replace(/_/g, ' ') || null;

  return {
    language,
    languageCode,
    timezone,
    city,
    isReturning: localStorage.getItem('chatbot-history') !== null,
    timeOfDay,
    isMobile,
    deviceType,
    screenWidth
  };
}
