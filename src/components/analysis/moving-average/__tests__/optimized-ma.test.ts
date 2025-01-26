import { calculateOptimizedMA } from '../optimized-ma';
import { MAConfig } from '../types';

describe('Optimized Moving Average Component', () => {
    const testPrices = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
    
    describe('calculateOptimizedMA', () => {
        it('should calculate simple moving average correctly', () => {
            const config: MAConfig = {
                period: 3,
                type: 'simple'
            };
            
            const result = calculateOptimizedMA(testPrices, config);
            
            expect(result.values).toBeDefined();
            expect(result.metadata.type).toBe('simple');
            expect(result.metadata.period).toBe(3);
            expect(result.metadata.calculationTime).toBeGreaterThan(0);
        });

        it('should calculate exponential moving average correctly', () => {
            const config: MAConfig = {
                period: 3,
                type: 'exponential'
            };
            
            const result = calculateOptimizedMA(testPrices, config);
            
            expect(result.values).toBeDefined();
            expect(result.metadata.type).toBe('exponential');
        });

        it('should handle invalid inputs appropriately', () => {
            const config: MAConfig = {
                period: 3,
                type: 'simple'
            };
            
            expect(() => calculateOptimizedMA([], config)).toThrow();
        });
    });
});