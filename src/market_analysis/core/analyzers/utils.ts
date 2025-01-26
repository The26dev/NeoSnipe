import { PricePoint } from '../../../shared/constants';

export function calculateVolumeProfile(
  priceHistory: PricePoint[], 
  index: number, 
  lookback: number
): number {
  const start = Math.max(0, index - lookback);
  const end = Math.min(priceHistory.length, index + lookback);
  
  let totalVolume = 0;
  let upVolume = 0;
  
  for (let i = start; i < end; i++) {
    const priceChange = priceHistory[i].price - priceHistory[i - 1]?.price;
    totalVolume += priceHistory[i].volume;
    if (priceChange > 0) {
      upVolume += priceHistory[i].volume;
    }
  }
  
  return totalVolume > 0 ? upVolume / totalVolume : 0;
}

export function calculateTrendStrength(
  shortMA: number[],
  longMA: number[],
  index: number,
  lookback: number
): number {
  const start = Math.max(0, index - lookback);
  const end = Math.min(shortMA.length, index + lookback);
  
  let consistentPeriods = 0;
  const total = end - start;
  
  for (let i = start; i < end; i++) {
    if (
      (shortMA[i] > longMA[i] && shortMA[i - 1] > longMA[i - 1]) ||
      (shortMA[i] < longMA[i] && shortMA[i - 1] < longMA[i - 1])
    ) {
      consistentPeriods++;
    }
  }
  
  return consistentPeriods / total;
}