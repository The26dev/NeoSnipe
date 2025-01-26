import { Pattern } from './market-types';

export interface CacheEntry {
    patterns: Pattern[];
    timestamp: number;
}

export interface PatternAnalysisState {
    patterns: Pattern[];
    loading: boolean;
    error: Error | null;
    confidence: number;
    performance: {
        gpuAccelerated: boolean;
        executionTime: number;
    };
}

export interface PatternRecognitionHook extends PatternAnalysisState {
    analyzePatterns: (priceData: PricePoint[]) => Promise<void>;
    metrics: {
        fps: number;
        frameTime: number;
        memoryUsage: number;
    };
}