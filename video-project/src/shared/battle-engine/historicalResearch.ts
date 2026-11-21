export type HistoricalEra =
  | 'ancient'
  | 'medieval'
  | 'napoleonic'
  | 'world-wars'
  | 'modern';

export interface PeriodSourceGuide {
  era: HistoricalEra;
  label: string;
  dateRange: string;
  primarySources: string[];
  searchQueryModifiers: string[];
  tacticalFocusChecklist: string[];
}

export const PERIOD_RESEARCH_MATRIX: Record<HistoricalEra, PeriodSourceGuide> = {
  ancient: {
    era: 'ancient',
    label: 'Ancient Warfare',
    dateRange: 'Pre-500 AD',
    primarySources: [
      'Polybius (The Histories)',
      'Livy (Ab Urbe Condita)',
      'Arrian (Anabasis of Alexander)',
      'Herodotus (The Histories)',
      'Thucydides (History of the Peloponnesian War)',
      'Julius Caesar (Commentarii de Bello Gallico / Civili)',
      'Plutarch (Parallel Lives)',
      'Xenophon (Anabasis / Hellenica)',
    ],
    searchQueryModifiers: [
      'Polybius Livy order of battle topography',
      'ancient battle terrain reconstruction river wind sun',
      'archaeological survey ancient battlefield deployment',
    ],
    tacticalFocusChecklist: [
      'Verify exact line depth (e.g., triplex acies, phalanx syntagma, crescent echelon)',
      'Check environmental factors recorded by chroniclers (wind, dust, sun angle, riverbanks)',
      'Cross-check ancient troop figures against modern historical consensus',
    ],
  },

  medieval: {
    era: 'medieval',
    label: 'Medieval Warfare',
    dateRange: '500 AD – 1500 AD',
    primarySources: [
      'Contemporary chronicles (Froissart, Anglo-Saxon Chronicle, Anna Komnene, Ibn al-Athir, Gesta Francorum)',
      'Battlefield archaeology surveys (metal-detector finds, mass-grave topography, terrain bottlenecks)',
      'Medieval rolls of arms & royal household muster records',
    ],
    searchQueryModifiers: [
      'contemporary chronicle account battle terrain',
      'battlefield archaeology survey terrain reconstruction',
      'medieval battle formation archers cavalry stakes mud',
    ],
    tacticalFocusChecklist: [
      'Model terrain bottlenecks (muddy plowed fields, marshland, hill crests, wooden stakes)',
      'Separate vanguard, main battle (centre), and rearguard divisions accurately',
      'Account for ranged bow/crossbow volleys preceding heavy cavalry charges',
    ],
  },

  napoleonic: {
    era: 'napoleonic',
    label: 'Napoleonic & Early Modern Warfare',
    dateRange: '1500 AD – 1850 AD',
    primarySources: [
      'French Dépôt de la Guerre & Napoleon Correspondence',
      'British War Office & Wellington Dispatches',
      'Clausewitz & Jomini campaign histories',
      'Regimental after-action returns & artillery battery logs',
    ],
    searchQueryModifiers: [
      'military archives dispatches order of battle map',
      'campaign history terrain ridge artillery deployment',
      'corps maneuver flanking march fog weather',
    ],
    tacticalFocusChecklist: [
      'Place grand artillery batteries on dominant ridges/heights',
      'Model reverse-slope infantry concealment and corps-level flanking marches',
      'Include weather/visibility factors (e.g., morning fog, rain-soaked ground)',
    ],
  },

  'world-wars': {
    era: 'world-wars',
    label: 'World Wars (WWI & WWII)',
    dateRange: '1914 – 1945',
    primarySources: [
      'Official military histories (US Army Green Books, British History of the Second World War)',
      'Unit War Diaries (Kriegstagebuch / British War Diaries) & After-Action Reports (AARs)',
      'Commander & frontline memoirs',
      'Military Staff College historical terrain studies',
    ],
    searchQueryModifiers: [
      'official military history order of battle map',
      'after action report war diary armored thrust pocket',
      'battle terrain rivers bridgehead defensive belt',
    ],
    tacticalFocusChecklist: [
      'Distinguish armored spearheads (armor), mechanized infantry, and anti-tank defense belts',
      'Model river crossings, bridgeheads, and encirclement pockets (Kessel)',
      'Include air-support interdiction arrows where decisive',
    ],
  },

  modern: {
    era: 'modern',
    label: 'Modern Warfare',
    dateRange: '1945 – Present',
    primarySources: [
      'Declassified government archives (DoD, CIA, UK MOD historical releases)',
      'Peer-reviewed military-science publications (RUSI, ISW, West Point Modern War Institute)',
      'UN/OSCE/satellite terrain & geospatial assessments',
    ],
    searchQueryModifiers: [
      'declassified military archive battle analysis map',
      'Modern War Institute RUSI tactical terrain analysis',
      'combined arms corridor highway chokepoint air defense',
    ],
    tacticalFocusChecklist: [
      'Model highway/urban chokepoints, air-defense bubbles, and combined-arms corridors',
      'Represent rapid mechanized flanking, airborne/amphibious landings, and air interdiction',
      'Cite institutional/declassified analyses clearly in historicalSources',
    ],
  },
};

export function getResearchGuideForEra(era: HistoricalEra): PeriodSourceGuide {
  return PERIOD_RESEARCH_MATRIX[era];
}
