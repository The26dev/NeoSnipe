export interface PricePoint {
    timestamp: number;
    price: number;
    volume?: number;
    marketCap?: number;
}

export const PATTERN_THRESHOLDS = {
    CONFIDENCE_THRESHOLD: 0.7,
    SIGNIFICANCE_THRESHOLD: 0.3,
    MINIMUM_DATA_POINTS: 10,
    GOLDEN_RATIO_TOLERANCE: 0.05
};

export const FIBONACCI_SEQUENCE = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

export const SACRED_RATIOS = {
    PHI: 1.618033988749895,
    SQRT_PHI: 1.272019649514069,
    PI: 3.141592653589793
};

export const PATTERN_TYPES = {
    GARTLEY: 'Gartley',
    BUTTERFLY: 'Butterfly',
    WAVE: 'Elliott Wave',
    GOLDEN_SPIRAL: 'Golden Spiral',
    FIBONACCI_RETRACEMENT: 'Fibonacci Retracement'
} as const;