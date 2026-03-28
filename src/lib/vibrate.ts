export const VIBRATION_PATTERNS = {
  CLICK: 15,
  HEAVY: 40,
  LIGHT: 10,
  SUCCESS: [20, 50, 20],
  ERROR: [50, 100, 50],
  HEAVY_LIGHT: [30, 50, 10],
  TROPHY: [40, 60, 40, 60, 40],
};

/**
 * Helper function to trigger device vibration
 * @param duration Duration in ms or a pattern array [vibrate, pause, vibrate]
 */
export const vibrate = (duration: number | number[] = 20) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(duration);
    } catch (error) {
      console.warn('Vibration failed:', error);
    }
  }
};
