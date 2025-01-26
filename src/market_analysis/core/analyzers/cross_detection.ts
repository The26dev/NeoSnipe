import { PricePoint } from '../../../shared/constants';
import { CrossValidation, Pattern, PatternTypes } from './types';
import { validateMAData, validatePriceHistory } from './validation';

export function detectCrossPattern(
  priceHistory: PricePoint[],
  shortMA: number[],
  longMA: number[]
): Pattern | null {
  try {
    if (!validatePriceHistory(priceHistory) || !validateMAData(shortMA) || !validateMAData(longMA)) {
      return null;
    }

    // Find and validate cross
    const cross = findLastCross(shortMA, longMA);
    if (!cross || cross.confidence < 70 || cross.strength < 50) {
      return null;
    }

    // Create pattern result
    return {
      type: cross.type === 'golden' ? PatternTypes.GOLDEN_CROSS : PatternTypes.DEATH_CROSS,
      startIndex: Math.max(0, cross.index - 5),
      endIndex: cross.index,
      confidence: cross.confidence,
      strength: cross.strength,
      description: `${cross.type === 'golden' ? 'Bullish Golden' : 'Bearish Death'} Cross detected with ${cross.confidence.toFixed(1)}% confidence and ${cross.strength.toFixed(1)}% strength`
    };
  } catch (error) {
    console.error('Error in cross pattern detection:', error);
    return null;
  }
}

function findLastCross(shortMA: number[], longMA: number[]): CrossValidation | null {
  try {
    for (let i = shortMA.length - 1; i > 0; i--) {
      const isGoldenCross = shortMA[i] > longMA[i] && shortMA[i - 1] <= longMA[i - 1];
      const isDeathCross = shortMA[i] < longMA[i] && shortMA[i - 1] >= longMA[i - 1];
      
      if (isGoldenCross || isDeathCross) {
        const { strength, confidence } = calculateCrossMetrics(shortMA, longMA, i, isGoldenCross);
        
        return {
          index: i,
          type: isGoldenCross ? 'golden' : 'death',
          strength,
          confidence
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error in finding cross:', error);
    return null;
  }
}

function calculateCrossMetrics(
  shortMA: number[],
  longMA: number[],
  index: number,
  isGoldenCross: boolean
): { strength: number; confidence: number } {
  const lookback = 5;
  const slopes = calculateSlopes(shortMA, longMA, index, lookback);
  
  // Calculate strength metrics
  const angleDiff = Math.abs(slopes.avgShortSlope - slopes.avgLongSlope);
  const separation = Math.abs(shortMA[index] - longMA[index]);
  const trendConsistency = validateTrendConsistency(slopes, isGoldenCross);
  
  const strength = Math.min(100, 
    (angleDiff * 40) + 
    (separation * 40) + 
    (trendConsistency.short ? 10 : 0) + 
    (trendConsistency.long ? 10 : 0)
  );
  
  const confidence = Math.min(100, 
    60 + 
    (angleDiff * 20) + 
    (separation * 20)
  );
  
  return { strength, confidence };
}

function calculateSlopes(
  shortMA: number[],
  longMA: number[],
  index: number,
  lookback: number
): { avgShortSlope: number; avgLongSlope: number; shortSlopes: number[]; longSlopes: number[] } {
  const shortSlopes: number[] = [];
  const longSlopes: number[] = [];
  
  for (let i = 0; i < lookback && (index - i) > 0; i++) {
    shortSlopes.push(shortMA[index - i] - shortMA[index - i - 1]);
    longSlopes.push(longMA[index - i] - longMA[index - i - 1]);
  }
  
  return {
    avgShortSlope: shortSlopes.reduce((a, b) => a + b, 0) / shortSlopes.length,
    avgLongSlope: longSlopes.reduce((a, b) => a + b, 0) / longSlopes.length,
    shortSlopes,
    longSlopes
  };
}

function validateTrendConsistency(
  slopes: { shortSlopes: number[]; longSlopes: number[] },
  isGoldenCross: boolean
): { short: boolean; long: boolean } {
  return {
    short: slopes.shortSlopes.every(slope => 
      (isGoldenCross && slope > 0) || (!isGoldenCross && slope < 0)
    ),
    long: slopes.longSlopes.every(slope => 
      (isGoldenCross && slope < 0) || (!isGoldenCross && slope > 0)
    )
  };
}