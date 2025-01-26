import { PricePoint } from '../../../shared/constants';
import { CrossValidation, CrossMetrics } from './types';
import { validateMAData, validatePriceHistory } from '../../../shared/analyzers/validation';
import { calculateSlopes, validateTrendConsistency } from './utils';

export interface Pattern {
    type: 'GOLDEN_CROSS' | 'DEATH_CROSS';
    timestamp: number;
    price: number;
    confidence: number;
    metrics: CrossMetrics;
}

export function detectCrossPattern(
    priceHistory: PricePoint[],
    shortMA: number[],
    longMA: number[]
): Pattern | null {
    try {
        if (!validatePriceHistory(priceHistory) || !validateMAData(shortMA, longMA)) {
            return null;
        }

        const lastCross = findLastCross(shortMA, longMA);
        if (!lastCross) {
            return null;
        }

        return {
            type: lastCross.type === 'bullish' ? 'GOLDEN_CROSS' : 'DEATH_CROSS',
            timestamp: lastCross.timestamp,
            price: lastCross.price,
            confidence: lastCross.strength * 100,
            metrics: {
                strength: lastCross.strength,
                confirmation: lastCross.strength > 0.7,
                trend: lastCross.type === 'bullish' ? 'up' : 'down'
            }
        };
    } catch (error) {
        console.error('Error in detectCrossPattern:', error);
        return null;
    }
}

function findLastCross(shortMA: number[], longMA: number[]): CrossValidation | null {
    try {
        for (let i = shortMA.length - 1; i > 0; i--) {
            const isGoldenCross = shortMA[i] > longMA[i] && shortMA[i - 1] <= longMA[i - 1];
            const isDeathCross = shortMA[i] < longMA[i] && shortMA[i - 1] >= longMA[i - 1];
            
            if (isGoldenCross || isDeathCross) {
                const metrics = calculateCrossMetrics(shortMA, longMA, i, isGoldenCross);
                
                return {
                    timestamp: Date.now(), // This should be derived from actual data in production
                    price: shortMA[i],
                    type: isGoldenCross ? 'bullish' : 'bearish',
                    strength: metrics.strength
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error in findLastCross:', error);
        return null;
    }
}

function calculateCrossMetrics(
    shortMA: number[],
    longMA: number[],
    crossIndex: number,
    isGoldenCross: boolean
): { strength: number; confidence: number } {
    const slopes = calculateSlopes(shortMA, longMA, crossIndex);
    const trendConsistency = validateTrendConsistency(shortMA, longMA, crossIndex, isGoldenCross);
    
    return {
        strength: (slopes.shortTermSlope + slopes.longTermSlope + trendConsistency) / 3,
        confidence: trendConsistency > 0.8 ? 1 : 0.5
    };
}