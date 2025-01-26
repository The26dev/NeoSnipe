/**
 * Core market analysis type definitions
 */

import { PricePoint } from '../shared/constants';

export interface MarketAnalysisConfig {
    timeframe: string;
    indicators: string[];
    thresholds: {
        minConfidence: number;
        maxLookback: number;
    };
}

export interface AnalysisResult {
    timestamp: number;
    status: 'success' | 'error';
    data: any;
    metadata: {
        executionTime: number;
        memoryUsage: number;
        source: string;
    };
}