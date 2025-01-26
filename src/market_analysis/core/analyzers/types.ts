// Pattern Recognition Types
import { PricePoint } from '../../../shared/constants';

export interface Pattern {
  type: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  strength: number;
  description: string;
}

export interface CrossValidation {
  index: number;
  type: 'golden' | 'death';
  strength: number;
  confidence: number;
}

export interface PriceSwing {
  price: number;
  index: number;
}

export interface HarmonicRatios {
  XA: number;
  AB: number;
  BC: number;
  CD: number;
  AD: number;
}

export interface PatternMetrics {
  totalAnalysisTime: number;
  patternCounts: {
    fibonacci: number;
    harmonic: number;
    cross: number;
  };
  lastOptimization: number;
}

export interface CacheEntry {
  patterns: Pattern[];
  timestamp: number;
}

export enum PatternTypes {
  GOLDEN_CROSS = 'Golden Cross',
  DEATH_CROSS = 'Death Cross',
  FIBONACCI_RETRACEMENT = 'Fibonacci Retracement',
  HARMONIC_PATTERN = 'Harmonic Pattern'
}