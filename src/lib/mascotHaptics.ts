// Precise vibration haptic feedback system for Nexora Living Mascots
// Respects user setting toggle (vibrationEnabled)

export type HapticType = 
  | 'tap'               // 25ms light pulse
  | 'challengeComplete' // 35ms success pulse
  | 'rewardClaim'        // 50ms celebration pulse
  | 'powerActivation'   // 60ms impact pulse
  | 'plantEvolution'    // 80ms transformation pulse
  | 'legendaryUnlock';  // multi-pulse celebration pattern

export function triggerHaptic(type: HapticType, vibrationEnabled = true) {
  if (!vibrationEnabled) return;
  if (typeof window === 'undefined' || !('navigator' in window) || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'tap':
        navigator.vibrate(25);
        break;
      case 'challengeComplete':
        navigator.vibrate([35, 30, 35]);
        break;
      case 'rewardClaim':
        navigator.vibrate([50, 40, 60]);
        break;
      case 'powerActivation':
        navigator.vibrate([40, 30, 80]);
        break;
      case 'plantEvolution':
        navigator.vibrate([60, 40, 90]);
        break;
      case 'legendaryUnlock':
        navigator.vibrate([40, 30, 40, 30, 80, 40, 100]);
        break;
      default:
        navigator.vibrate(30);
        break;
    }
  } catch (e) {
    // Ignore unsupported devices silently
  }
}
