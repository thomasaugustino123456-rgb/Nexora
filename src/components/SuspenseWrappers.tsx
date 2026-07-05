import React from 'react';
import WhatIsNewModal from './WhatIsNewModal';
import { HappyMascot as HappyMascot_Direct, LevelUpCelebration as LevelUpCelebration_Direct, CoinAnimation as CoinAnimation_Direct } from './FeedbackUI';
import { MascotAI } from './MascotAI';

export function WhatIsNewModalWrapper(props: any) {
  return <WhatIsNewModal {...props} />;
}

export function HappyMascot(props: any) {
  return <HappyMascot_Direct {...props} />;
}

export function LevelUpCelebration(props: any) {
  return <LevelUpCelebration_Direct {...props} />;
}

export function CoinAnimation(props: any) {
  return <CoinAnimation_Direct {...props} />;
}

export function MascotAIWrapper(props: any) {
  return <MascotAI {...props} />;
}
