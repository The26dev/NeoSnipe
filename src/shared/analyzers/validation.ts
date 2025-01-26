import { PricePoint } from '../constants';

export function validatePriceHistory(priceHistory: PricePoint[]): boolean {
    if (!Array.isArray(priceHistory) || priceHistory.length === 0) {
        return false;
    }
    return true;
}

export function validateMAData(shortMA: number[], longMA: number[]): boolean {
    if (!Array.isArray(shortMA) || !Array.isArray(longMA)) {
        return false;
    }
    if (shortMA.length !== longMA.length || shortMA.length === 0) {
        return false;
    }
    return true;
}