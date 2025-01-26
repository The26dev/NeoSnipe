export interface MAConfig {
    period: number;
    type: 'simple' | 'exponential' | 'weighted';
    weight?: number;
}

export interface MAResult {
    values: number[];
    metadata: {
        period: number;
        type: string;
        calculationTime: number;
        memoryUsage: number;
    };
}

export interface PerformanceMetrics {
    executionTime: number;
    memoryUsage: number;
    optimizationLevel: 'high' | 'medium' | 'low';
}