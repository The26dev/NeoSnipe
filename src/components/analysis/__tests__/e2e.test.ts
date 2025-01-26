import { calculateOptimizedMA } from '../moving-average/optimized-ma';
import { detectCrossPattern } from '../cross_detection/cross_detection';
import { MAConfig } from '../moving-average/types';
import { PricePoint } from '../../../shared/constants';
import { MarketAnalysisConfig } from '../../../types/market-analysis.types';

describe('Market Analysis End-to-End Tests', () => {
    // Test data setup
    const generateTestData = (length: number): PricePoint[] => {
        return Array.from({ length }, (_, i) => ({
            timestamp: Date.now() + i * 60000,
            price: 100 + Math.sin(i * 0.1) * 10
        }));
    };

    describe('Full Analysis Pipeline', () => {
        it('should process complete market analysis workflow', async () => {
            const testData = generateTestData(100);
            const prices = testData.map(d => d.price);

            // Calculate moving averages
            const shortTermMA = calculateOptimizedMA(prices, {
                period: 10,
                type: 'exponential'
            });

            const longTermMA = calculateOptimizedMA(prices, {
                period: 20,
                type: 'exponential'
            });

            // Detect patterns
            const pattern = detectCrossPattern(
                testData,
                shortTermMA.values,
                longTermMA.values
            );

            // Verify full pipeline
            expect(pattern).toBeDefined();
            expect(shortTermMA.metadata.calculationTime).toBeLessThan(50);
            expect(longTermMA.metadata.calculationTime).toBeLessThan(50);
            expect(pattern?.metrics.strength).toBeGreaterThan(0);
        });

        it('should handle large datasets efficiently', () => {
            const largeDataset = generateTestData(1000);
            const prices = largeDataset.map(d => d.price);

            const startTime = performance.now();
            
            // Process large dataset
            const ma = calculateOptimizedMA(prices, {
                period: 20,
                type: 'simple'
            });

            const endTime = performance.now();
            const totalTime = endTime - startTime;

            expect(totalTime).toBeLessThan(200);
            expect(ma.metadata.optimizationLevel).toBe('high');
        });
    });
});