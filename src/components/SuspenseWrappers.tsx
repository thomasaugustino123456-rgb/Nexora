import React, { Suspense, lazy } from 'react';

const WhatIsNewModal = lazy(() => import('./WhatIsNewModal').then(m => ({ default: m.WhatIsNewModal })));
const HappyMascot_Lazy = lazy(() => import('./FeedbackUI').then(m => ({ default: m.HappyMascot })));
const LevelUpCelebration_Lazy = lazy(() => import('./FeedbackUI').then(m => ({ default: m.LevelUpCelebration })));
const CoinAnimation_Lazy = lazy(() => import('./FeedbackUI').then(m => ({ default: m.CoinAnimation })));
const MascotAI_Lazy = lazy(() => import('./MascotAI').then(m => ({ default: m.MascotAI })));

export function WhatIsNewModalWrapper(props: any) {
  return (
    <Suspense fallback={null}>
      <WhatIsNewModal {...props} />
    </Suspense>
  );
}

export function HappyMascot(props: any) {
  return (
    <Suspense fallback={null}>
      <HappyMascot_Lazy {...props} />
    </Suspense>
  );
}

export function LevelUpCelebration(props: any) {
  return (
    <Suspense fallback={null}>
      <LevelUpCelebration_Lazy {...props} />
    </Suspense>
  );
}

export function CoinAnimation(props: any) {
  return (
    <Suspense fallback={null}>
      <CoinAnimation_Lazy {...props} />
    </Suspense>
  );
}

export function MascotAIWrapper(props: any) {
  return (
    <Suspense fallback={null}>
      <MascotAI_Lazy {...props} />
    </Suspense>
  );
}
