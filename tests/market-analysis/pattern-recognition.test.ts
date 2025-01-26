import { PatternRecognitionEngine } from '../../src/utils/pattern-recognition';
import { MarketDataProvider } from '../../src/services/market-data';
import { Pattern, PatternType } from '../../src/types/patterns';

describe('Pattern Recognition Algorithm Tests', () => {
  let engine: PatternRecognitionEngine;
  let marketData: MarketDataProvider;

  beforeEach(() => {
    marketData = new MarketDataProvider();
    engine = new PatternRecognitionEngine(marketData);
  });

  test('identifies basic geometric patterns', async () => {
    const data = await marketData.getHistoricalData('TEST', '1d', 100);
    const patterns = await engine.analyzePatterns(data);
    
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0]).toHaveProperty('type');
    expect(patterns[0]).toHaveProperty('confidence');
  });

  test('calculates pattern confidence scores', async () => {
    const data = await marketData.getHistoricalData('TEST', '1d', 100);
    const patterns = await engine.analyzePatterns(data);
    
    patterns.forEach(pattern => {
      expect(pattern.confidence).toBeGreaterThanOrEqual(0);
      expect(pattern.confidence).toBeLessThanOrEqual(1);
    });
  });

  test('handles different timeframes', async () => {
    const timeframes = ['1m', '5m', '1h', '1d'];
    
    for (const timeframe of timeframes) {
      const data = await marketData.getHistoricalData('TEST', timeframe, 100);
      const patterns = await engine.analyzePatterns(data);
      expect(patterns.length).toBeGreaterThan(0);
    }
  });

  test('recognizes complex pattern combinations', async () => {
    const data = await marketData.getHistoricalData('TEST', '1d', 200);
    const patterns = await engine.analyzePatterns(data, {
      minConfidence: 0.8,
      patternTypes: ['FIBONACCI', 'HARMONIC']
    });

    expect(patterns.some(p => p.type === 'FIBONACCI')).toBeTruthy();
    expect(patterns.some(p => p.type === 'HARMONIC')).toBeTruthy();
  });
});