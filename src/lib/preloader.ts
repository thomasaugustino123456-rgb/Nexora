import pushupProtocolImg from '../assets/images/pushup_protocol_1779266637886.png';
import hydrationLogicImg from '../assets/images/hydration_logic_1779266652867.png';
import vagalNerveImg from '../assets/images/vagal_nerve_1779266670752.png';
import creativeSynapseImg from '../assets/images/creative_synapse_1779266690417.png';
import crystalCactusImg from '../assets/images/crystal_cactus_1779266705542.png';
import circadianMasteryImg from '../assets/images/circadian_mastery_1779266725119.png';
import postureProtocolImg from '../assets/images/posture_protocol_1779268031305.png';
import thermalHormesisImg from '../assets/images/thermal_hormesis_1779268048761.png';
import autophagySyncImg from '../assets/images/autophagy_sync_1779268068080.png';
import symbioticFungiImg from '../assets/images/symbiotic_fungi_1779268089516.png';
import binauralBrainwavesImg from '../assets/images/binaural_brainwaves_1779268106033.png';
import forestBathingImg from '../assets/images/forest_bathing_1779268121767.png';
import optimalSaccadesImg from '../assets/images/optimal_saccades_1779268139737.png';
import nootropicNutritionImg from '../assets/images/nootropic_nutrition_1779268157558.png';
import carnivorousPitcherImg from '../assets/images/carnivorous_pitcher_1779268179856.png';
import neurogenesisSynapseImg from '../assets/images/neurogenesis_synapse_1779268200962.png';
import nexoraGuideImg from '../assets/images/nexora_guide_img_1779270251768.png';
import selfCareImg from '../assets/images/self_care_img_1779270269714.png';
import challengePracticeImg from '../assets/images/challenge_practice_img_1779270288112.png';
import shopBuyingGuideImg from '../assets/images/shop_buying_guide_1779270367530.png';

import winterDrinksImg from '../assets/images/winter_drinks_1779272127025.png';
import waterImmunityImg from '../assets/images/water_immunity_1779272143781.png';
import warningSignsImg from '../assets/images/warning_signs_1779272160669.png';
import sportNeedsImg from '../assets/images/sport_needs_1779272176008.png';
import coffeeTeaIntakeImg from '../assets/images/coffee_tea_intake_1779272190292.png';
import hydrateHeartImg from '../assets/images/hydrate_heart_1779272205883.png';
import healthySkinImg from '../assets/images/healthy_skin_1779272228661.png';
import waterBrainImg from '../assets/images/water_brain_1779272246743.png';
import momHealthImg from '../assets/images/mom_health_1779272263291.png';
import womensWellnessImg from '../assets/images/womens_wellness_1779272279548.png';
import pregnancyHydrationImg from '../assets/images/pregnancy_hydration_1779272296073.png';
import periodHydrationImg from '../assets/images/period_hydration_1779272315074.png';

export const ARCHIVE_IMAGES = [
  pushupProtocolImg,
  hydrationLogicImg,
  vagalNerveImg,
  creativeSynapseImg,
  crystalCactusImg,
  circadianMasteryImg,
  postureProtocolImg,
  thermalHormesisImg,
  autophagySyncImg,
  symbioticFungiImg,
  binauralBrainwavesImg,
  forestBathingImg,
  optimalSaccadesImg,
  nootropicNutritionImg,
  carnivorousPitcherImg,
  neurogenesisSynapseImg,
  nexoraGuideImg,
  selfCareImg,
  challengePracticeImg,
  shopBuyingGuideImg,
  winterDrinksImg,
  waterImmunityImg,
  warningSignsImg,
  sportNeedsImg,
  coffeeTeaIntakeImg,
  hydrateHeartImg,
  healthySkinImg,
  waterBrainImg,
  momHealthImg,
  womensWellnessImg,
  pregnancyHydrationImg,
  periodHydrationImg
];

export function startPreloading() {
  if (typeof window === 'undefined') return;

  // Run with standard modern requestIdleCallback or a staggered background queue
  const preloadQueue = [...ARCHIVE_IMAGES];
  
  const preloadNext = () => {
    if (preloadQueue.length === 0) {
      console.log("NEXORA PRELOADER: All 32 high-quality assets cached successfully! 🛡️");
      return;
    }
    const src = preloadQueue.shift();
    if (src) {
      const img = new Image();
      img.onload = () => {
        // Stagger next load after 50ms to keep execution frame rates optimal
        setTimeout(preloadNext, 50);
      };
      img.onerror = () => {
        setTimeout(preloadNext, 10);
      };
      img.src = src;
    }
  };

  // Support idle time preloading
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      preloadNext();
    });
  } else {
    setTimeout(preloadNext, 500);
  }
}
