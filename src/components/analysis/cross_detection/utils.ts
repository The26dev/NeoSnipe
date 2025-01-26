/**
 * Utility functions for cross detection analysis
 */

export function calculateSlopes(
    shortMA: number[],
    longMA: number[],
    crossIndex: number
): { shortTermSlope: number; longTermSlope: number } {
    const lookback = Math.min(5, crossIndex);
    
    const shortTermSlope = calculateSlope(shortMA, crossIndex, lookback);
    const longTermSlope = calculateSlope(longMA, crossIndex, lookback);
    
    return {
        shortTermSlope: normalizeSlope(shortTermSlope),
        longTermSlope: normalizeSlope(longTermSlope)
    };
}

export function validateTrendConsistency(
    shortMA: number[],
    longMA: number[],
    crossIndex: number,
    isGoldenCross: boolean
): number {
    const lookback = Math.min(10, crossIndex);
    let consistentPoints = 0;
    
    for (let i = crossIndex; i > crossIndex - lookback; i--) {
        if (isGoldenCross) {
            if (shortMA[i] >= longMA[i]) consistentPoints++;
        } else {
            if (shortMA[i] <= longMA[i]) consistentPoints++;
        }
    }
    
    return consistentPoints / lookback;
}

function calculateSlope(data: number[], startIndex: number, lookback: number): number {
    const x1 = startIndex - lookback;
    const x2 = startIndex;
    const y1 = data[x1];
    const y2 = data[x2];
    
    return (y2 - y1) / lookback;
}

function normalizeSlope(slope: number): number {
    const maxSlope = 1.0;
    return Math.min(Math.max(slope, -maxSlope), maxSlope);
}