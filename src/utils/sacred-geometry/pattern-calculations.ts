import { GeometryData, PatternType } from '../../types/sacred-geometry';
import { PHI, SQRT_PHI } from './geometry';

export interface PatternMetrics {
  ratios: number[];
  symmetry: number;
  complexity: number;
  harmonicResonance: number;
}

export class PatternCalculations {
  static calculateGeometricRatios(data: GeometryData): PatternMetrics {
    const { points, angles, distances } = data;
    
    const ratios = this.calculateRatios(distances);
    const symmetry = this.calculateSymmetry(angles);
    const complexity = this.calculateComplexity(points, distances);
    const harmonicResonance = this.calculateHarmonicResonance(ratios);

    return {
      ratios,
      symmetry,
      complexity,
      harmonicResonance
    };
  }

  private static calculateRatios(distances: number[]): number[] {
    const ratios: number[] = [];
    for (let i = 0; i < distances.length - 1; i++) {
      for (let j = i + 1; j < distances.length; j++) {
        const ratio = distances[i] / distances[j];
        ratios.push(ratio);
      }
    }
    return ratios;
  }

  private static calculateSymmetry(angles: number[]): number {
    let symmetryScore = 0;
    const angleGroups = new Map<number, number>();
    
    angles.forEach(angle => {
      const normalizedAngle = Math.round(angle * 100) / 100;
      angleGroups.set(normalizedAngle, (angleGroups.get(normalizedAngle) || 0) + 1);
    });

    symmetryScore = Array.from(angleGroups.values())
      .reduce((score, count) => score + (count > 1 ? count : 0), 0) / angles.length;

    return symmetryScore;
  }

  private static calculateComplexity(points: number[][], distances: number[]): number {
    const uniqueDistances = new Set(distances.map(d => Math.round(d * 100) / 100));
    const pointDensity = points.length / Math.max(...distances);
    return (uniqueDistances.size * pointDensity) / PHI;
  }

  private static calculateHarmonicResonance(ratios: number[]): number {
    const phiDeviation = ratios.reduce((sum, ratio) => {
      return sum + Math.abs(ratio - PHI);
    }, 0) / ratios.length;

    const sqrtPhiDeviation = ratios.reduce((sum, ratio) => {
      return sum + Math.abs(ratio - SQRT_PHI);
    }, 0) / ratios.length;

    return 1 - Math.min(phiDeviation, sqrtPhiDeviation);
  }

  static identifyPattern(metrics: PatternMetrics): PatternType {
    if (metrics.harmonicResonance > 0.9 && metrics.symmetry > 0.8) {
      return 'flowerOfLife';
    } else if (metrics.complexity > 1.5 && metrics.symmetry > 0.7) {
      return 'metatronsCube';
    } else if (metrics.harmonicResonance > 0.8 && metrics.complexity < 1.2) {
      return 'vesicaPiscis';
    } else if (metrics.symmetry > 0.9) {
      return 'sriYantra';
    } else {
      return 'unknown';
    }
  }
}