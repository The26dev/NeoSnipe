import { PricePoint } from '../../../shared/constants';

export interface CrossValidation {
    timestamp: number;
    price: number;
    type: 'bullish' | 'bearish';
    strength: number;
}

export interface CrossMetrics {
    strength: number;
    confirmation: boolean;
    trend: 'up' | 'down' | 'neutral';
}