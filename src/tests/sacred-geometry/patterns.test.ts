import { generatePattern } from '../../utils/sacred-geometry/patterns';
import { PatternCalculations } from '../../utils/sacred-geometry/pattern-calculations';
import { GeometryData, PatternType } from '../../types/sacred-geometry';
import { PHI, SQRT_PHI } from '../../utils/sacred-geometry/geometry';

describe('Sacred Geometry Patterns', () => {
  describe('generatePattern', () => {
    test.each([
      ['flowerOfLife'],
      ['metatronsCube'],
      ['vesicaPiscis'],
      ['sriYantra']
    ])('generates valid %s pattern', (type: PatternType) => {
      const pattern = generatePattern(type as PatternType);
      
      expect(pattern).toBeDefined();
      expect(pattern.type).toBe(type);
      expect(pattern.metrics).toBeDefined();
      expect(pattern.visualization).toBeDefined();
      expect(pattern.shaderConfig).toBeDefined();
      
      // Verify visualization data
      expect(pattern.visualization.vertices.length).toBeGreaterThan(0);
      expect(pattern.visualization.indices.length).toBeGreaterThan(0);
      expect(pattern.visualization.textureCoords.length).toBeGreaterThan(0);
    });

    test('throws error for invalid pattern type', () => {
      expect(() => generatePattern('invalid' as PatternType)).toThrow();
    });
  });

  describe('PatternCalculations', () => {
    const mockGeometryData: GeometryData = {
      points: [[0, 0], [1, 0], [0, 1]],
      angles: [0, Math.PI / 2, Math.PI],
      distances: [1, 1, Math.sqrt(2)]
    };

    test('calculateGeometricRatios returns valid metrics', () => {
      const metrics = PatternCalculations.calculateGeometricRatios(mockGeometryData);
      
      expect(metrics.ratios).toBeDefined();
      expect(metrics.symmetry).toBeGreaterThanOrEqual(0);
      expect(metrics.symmetry).toBeLessThanOrEqual(1);
      expect(metrics.complexity).toBeGreaterThan(0);
      expect(metrics.harmonicResonance).toBeGreaterThanOrEqual(0);
      expect(metrics.harmonicResonance).toBeLessThanOrEqual(1);
    });

    test('identifyPattern correctly identifies known patterns', () => {
      const mockMetrics = {
        ratios: [PHI, SQRT_PHI],
        symmetry: 1.0,
        complexity: 1.2,
        harmonicResonance: 0.95
      };

      const pattern = PatternCalculations.identifyPattern(mockMetrics);
      expect(pattern).toBe('flowerOfLife');
    });
  });
});