/**
 * Compatibility Calculator - TypeScript Port
 * 
 * Core compatibility calculation logic ported from Python base_model.py
 */

export interface PersonVector {
  traits: number[]; // 32D vector
}

export interface ResonanceVector {
  metrics: number[]; // 7D vector
}

export interface CompatibilityResult {
  c_traits: number;
  c_res: number;
  c_total: number;
  s_hat: number;
  feasibility: number;
}

/**
 * Calculate Euclidean distance between two trait vectors
 */
export function traitDistance(p1: PersonVector, p2: PersonVector): number {
  if (p1.traits.length !== 32 || p2.traits.length !== 32) {
    throw new Error('Person vectors must have exactly 32 dimensions');
  }
  
  let sum = 0;
  for (let i = 0; i < 32; i++) {
    const diff = p1.traits[i] - p2.traits[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Calculate trait compatibility: C_traits = exp(-D_traits)
 */
export function traitCompatibility(p1: PersonVector, p2: PersonVector): number {
  const distance = traitDistance(p1, p2);
  return Math.exp(-distance);
}

/**
 * Calculate resonance compatibility: C_res = β₁ R_mean + β₂ R_stab
 */
export function resonanceCompatibility(r: ResonanceVector): number {
  if (r.metrics.length !== 7) {
    throw new Error('Resonance vector must have exactly 7 dimensions');
  }
  
  // Calculate mean
  const mean = r.metrics.reduce((sum, val) => sum + val, 0) / 7;
  
  // Calculate variance
  const variance = r.metrics.reduce((sum, val) => {
    const diff = val - mean;
    return sum + diff * diff;
  }, 0) / 7;
  
  // Stability = 1 - variance (clamped to [0, 1])
  const stability = Math.max(0, Math.min(1, 1 - variance));
  
  // C_res = 0.5 * mean + 0.5 * stability
  return 0.5 * mean + 0.5 * stability;
}

/**
 * Calculate total compatibility: C_total = γ₁ C_traits + γ₂ C_res
 */
export function totalCompatibility(
  p1: PersonVector,
  p2: PersonVector,
  r: ResonanceVector,
  feasibility: number = 1.0
): CompatibilityResult {
  const c_traits = traitCompatibility(p1, p2);
  const c_res = resonanceCompatibility(r);
  
  // C_total = 0.6 * C_traits + 0.4 * C_res
  const c_total = 0.6 * c_traits + 0.4 * c_res;
  
  // S_hat = F(i,j) * C_total
  const s_hat = feasibility * c_total;
  
  return {
    c_traits,
    c_res,
    c_total,
    s_hat,
    feasibility,
  };
}

/**
 * Calculate dimension-specific alignments
 */
export function calculateDimensionAlignments(
  p1: PersonVector,
  p2: PersonVector
): {
  attachment: number;
  conflict: number;
  cognitive: number;
  values: number;
  social: number;
  sexual: number;
  lifeStructure: number;
} {
  const alignments = {
    attachment: 0,
    conflict: 0,
    cognitive: 0,
    values: 0,
    social: 0,
    sexual: 0,
    lifeStructure: 0,
  };
  
  // Attachment & Regulation (0-4)
  for (let i = 0; i < 5; i++) {
    alignments.attachment += Math.abs(p1.traits[i] - p2.traits[i]);
  }
  alignments.attachment = 1 - (alignments.attachment / 5);
  
  // Conflict & Communication (5-9)
  for (let i = 5; i < 10; i++) {
    alignments.conflict += Math.abs(p1.traits[i] - p2.traits[i]);
  }
  alignments.conflict = 1 - (alignments.conflict / 5);
  
  // Cognitive & Decision Style (10-14)
  for (let i = 10; i < 15; i++) {
    alignments.cognitive += Math.abs(p1.traits[i] - p2.traits[i]);
  }
  alignments.cognitive = 1 - (alignments.cognitive / 5);
  
  // Value Architecture (15-20)
  for (let i = 15; i < 21; i++) {
    alignments.values += Math.abs(p1.traits[i] - p2.traits[i]);
  }
  alignments.values = 1 - (alignments.values / 6);
  
  // Social & Interpersonal Style (21-25)
  for (let i = 21; i < 26; i++) {
    alignments.social += Math.abs(p1.traits[i] - p2.traits[i]);
  }
  alignments.social = 1 - (alignments.social / 5);
  
  // Sexual System (26-28)
  for (let i = 26; i < 29; i++) {
    alignments.sexual += Math.abs(p1.traits[i] - p2.traits[i]);
  }
  alignments.sexual = 1 - (alignments.sexual / 3);
  
  // Life Structure (29-31)
  for (let i = 29; i < 32; i++) {
    alignments.lifeStructure += Math.abs(p1.traits[i] - p2.traits[i]);
  }
  alignments.lifeStructure = 1 - (alignments.lifeStructure / 3);
  
  // Clamp all to [0, 1]
  Object.keys(alignments).forEach(key => {
    alignments[key as keyof typeof alignments] = Math.max(0, Math.min(1, alignments[key as keyof typeof alignments]));
  });
  
  return alignments;
}

/**
 * Calculate numerology compatibility score
 */
export function numerologyCompatibility(birthdate1: string, birthdate2: string): number {
  function lifePathNumber(birthdate: string): number {
    const digits = birthdate.replace(/-/g, '');
    let total = 0;
    for (const digit of digits) {
      total += parseInt(digit, 10);
    }
    while (total > 9) {
      total = total.toString().split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
    }
    return total;
  }
  
  const lp1 = lifePathNumber(birthdate1);
  const lp2 = lifePathNumber(birthdate2);
  
  if (lp1 === lp2) {
    return 1.0;
  } else if (Math.abs(lp1 - lp2) <= 2) {
    return 0.7;
  } else {
    return 0.3;
  }
}

/**
 * Calculate astrology compatibility score
 */
export function astrologyCompatibility(birthdate1: string, birthdate2: string): number {
  function zodiacSign(birthdate: string): string {
    const [year, month, day] = birthdate.split('-').map(Number);
    
    const signs = [
      { name: 'Aquarius', start: [1, 20], end: [2, 18] },
      { name: 'Pisces', start: [2, 19], end: [3, 20] },
      { name: 'Aries', start: [3, 21], end: [4, 19] },
      { name: 'Taurus', start: [4, 20], end: [5, 20] },
      { name: 'Gemini', start: [5, 21], end: [6, 20] },
      { name: 'Cancer', start: [6, 21], end: [7, 22] },
      { name: 'Leo', start: [7, 23], end: [8, 22] },
      { name: 'Virgo', start: [8, 23], end: [9, 22] },
      { name: 'Libra', start: [9, 23], end: [10, 22] },
      { name: 'Scorpio', start: [10, 23], end: [11, 21] },
      { name: 'Sagittarius', start: [11, 22], end: [12, 21] },
      { name: 'Capricorn', start: [12, 22], end: [1, 19] },
    ];
    
    for (const sign of signs) {
      const [m1, d1] = sign.start;
      const [m2, d2] = sign.end;
      
      if (
        (month === m1 && day >= d1) ||
        (month === m2 && day <= d2) ||
        (m1 > m2 && (month === m1 || month === m2))
      ) {
        return sign.name;
      }
    }
    
    return 'Capricorn';
  }
  
  function element(sign: string): string {
    const fire = ['Aries', 'Leo', 'Sagittarius'];
    const earth = ['Taurus', 'Virgo', 'Capricorn'];
    const air = ['Gemini', 'Libra', 'Aquarius'];
    const water = ['Cancer', 'Scorpio', 'Pisces'];
    
    if (fire.includes(sign)) return 'Fire';
    if (earth.includes(sign)) return 'Earth';
    if (air.includes(sign)) return 'Air';
    return 'Water';
  }
  
  const sign1 = zodiacSign(birthdate1);
  const sign2 = zodiacSign(birthdate2);
  const elem1 = element(sign1);
  const elem2 = element(sign2);
  
  if (elem1 === elem2) {
    return 1.0;
  } else if (
    (elem1 === 'Fire' && elem2 === 'Air') ||
    (elem1 === 'Air' && elem2 === 'Fire') ||
    (elem1 === 'Earth' && elem2 === 'Water') ||
    (elem1 === 'Water' && elem2 === 'Earth')
  ) {
    return 0.7;
  } else {
    return 0.4;
  }
}

