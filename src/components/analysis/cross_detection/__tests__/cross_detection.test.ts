import { detectCrossPattern } from '../cross_detection';
import { PricePoint } from '../../../../shared/constants';

describe('Cross Detection Component', () => {
    let mockPriceHistory: PricePoint[];
    let mockShortMA: number[];
    let mockLongMA: number[];

    beforeEach(() => {
        mockPriceHistory = [
            { timestamp: 1, price: 100 },
            { timestamp: 2, price: 105 },
            { timestamp: 3, price: 110 }
        ];
        mockShortMA = [100, 102, 105];
        mockLongMA = [101, 101, 102];
    });

    describe('detectCrossPattern', () => {
        it('should detect a golden cross', () => {
            const result = detectCrossPattern(mockPriceHistory, mockShortMA, mockLongMA);
            
            expect(result).not.toBeNull();
            expect(result?.type).toBe('GOLDEN_CROSS');
        });

        it('should return null for invalid input', () => {
            const result = detectCrossPattern([], [], []);
            expect(result).toBeNull();
        });
    });
});