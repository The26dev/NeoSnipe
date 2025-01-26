// Mathematical constants
export const PHI = 1.61803398875;
export const SQRT_PHI = 1.272019649514;
export const TAU = 6.28318530718;

// Geometric ratios
export const GOLDEN_ANGLE = TAU * (1 - 1 / PHI);
export const SACRED_PROPORTIONS = {
  PHI,
  SQRT_PHI,
  GOLDEN_ANGLE,
  VESICA_RATIO: Math.sqrt(3),
  PENTAGON_RATIO: (1 + Math.sqrt(5)) / 2
};

// Base geometry configurations
export const DEFAULT_CIRCLE_SEGMENTS = 64;
export const DEFAULT_SCALE = 1.0;
export const DEFAULT_ROTATION = 0.0;

// Pattern-specific constants
export const FLOWER_OF_LIFE_RINGS = 3;
export const METATRONS_CUBE_SCALE = 1.2;
export const VESICA_PISCIS_OVERLAP = 0.5;
export const SRI_YANTRA_TRIANGLES = 9;