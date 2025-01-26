import { calculateOptimizedMA } from '../moving-average/optimized-ma';
import { detectCrossPattern } from '../cross_detection/cross_detection';
import { MAConfig } from '../moving-average/types';
import { PricePoint } from '../../../shared/constants';

describe('Market Analysis Components Integration', () => {
    const mockPrices = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
    const mockPriceHistory: PricePoint[] = mockPrices.map((price, index) => ({
        timestamp: index + 1,
        price
    }));

    describe('Moving Average and Cross Detection Integration', () => {
        it('should detect cross patterns using calculated moving averages', () => {
            // Calculate short-term MA
            const shortConfig: MAConfig = {
                period: 3,
                type: 'simple'
            };
            const shortMA = calculateOptimizedMA(mockPrices, shortConfig);

            // Calculate long-term MA
            const longConfig: MAConfig = {
                period: 5,
                type: 'simple'
            };
            const longMA = calculateOptimizedMA(mockPrices, longConfig);

            // Detect cross patterns
            const pattern = detectCrossPattern(
                mockPriceHistory,
                shortMA.values,
                longMA.values
            );

            // Verify integration
            expect(pattern).not.toBeNull();
            expect(pattern?.metrics).toBeDefined();
            expect(pattern?.metrics.strength).toBeGreaterThan(0);
        });

        it('should handle performance monitoring across components', () => {
            const shortConfig: MAConfig = {
                period: 3,
                type: 'exponential'
            };
            const result = calculateOptimizedMA(mockPrices, shortConfig);

            expect(result.metadata.calculationTime).toBeDefined();
            expect(result.metadata.memoryUsage).toBeDefined();
            expect(typeof result.metadata.calculationTime).toBe('number');
        });
    });
});