import { PricePoint } from '../../../shared/constants';

export function validatePriceHistory(priceHistory: PricePoint[]): boolean {
  if (!Array.isArray(priceHistory) || priceHistory.length < 2) {
    return false;
  }

  return priceHistory.every(point => 
    typeof point.price === 'number' &&
    typeof point.volume === 'number' &&
    !isNaN(point.price) &&
    !isNaN(point.volume) &&
    point.price > 0 &&
    point.volume >= 0
  );
}

export function validateMAData(data: number[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  return data.every(value => 
    typeof value === 'number' &&
    !isNaN(value) &&
    value > 0
  );
}

export function validatePatternMetrics(confidence: number, strength: number): boolean {
  return (
    typeof confidence === 'number' &&
    typeof strength === 'number' &&
    !isNaN(confidence) &&
    !isNaN(strength) &&
    confidence >= 0 &&
    confidence <= 100 &&
    strength >= 0 &&
    strength <= 100
  );
}