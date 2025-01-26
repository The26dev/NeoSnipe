import { MAConfig, MAResult, PerformanceMetrics } from './types';
import { monitorPerformance } from '../../../utils/performance-monitor';
import { trackMemoryUsage } from '../../../utils/memory-monitor';

/**
 * Calculates moving averages with optimized performance and memory usage
 */
export function calculateOptimizedMA(prices: number[], config: MAConfig): MAResult {
    const startTime = performance.now();
    const initialMemory = trackMemoryUsage();

    try {
        const values = calculateMA(prices, config);
        const metrics = getPerformanceMetrics(startTime, initialMemory);

        return {
            values,
            metadata: {
                period: config.period,
                type: config.type,
                calculationTime: metrics.executionTime,
                memoryUsage: metrics.memoryUsage
            }
        };
    } catch (error) {
        console.error('Error in MA calculation:', error);
        throw error;
    }
}

function calculateMA(prices: number[], config: MAConfig): number[] {
    switch (config.type) {
        case 'simple':
            return calculateSMA(prices, config.period);
        case 'exponential':
            return calculateEMA(prices, config.period);
        case 'weighted':
            return calculateWMA(prices, config.period, config.weight);
        default:
            throw new Error(`Unsupported MA type: ${config.type}`);
    }
}

function calculateSMA(prices: number[], period: number): number[] {
    const result = new Array(prices.length).fill(0);
    let sum = 0;

    // Calculate first SMA
    for (let i = 0; i < period; i++) {
        sum += prices[i];
    }
    result[period - 1] = sum / period;

    // Calculate remaining SMAs optimized
    for (let i = period; i < prices.length; i++) {
        sum = sum - prices[i - period] + prices[i];
        result[i] = sum / period;
    }

    return result;
}

function calculateEMA(prices: number[], period: number): number[] {
    const result = new Array(prices.length).fill(0);
    const multiplier = 2 / (period + 1);
    
    // Initialize first EMA with SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += prices[i];
    }
    result[period - 1] = sum / period;

    // Calculate EMA
    for (let i = period; i < prices.length; i++) {
        result[i] = (prices[i] - result[i - 1]) * multiplier + result[i - 1];
    }

    return result;
}

function calculateWMA(prices: number[], period: number, weight: number = 1): number[] {
    const result = new Array(prices.length).fill(0);
    const weights = new Array(period).fill(0).map((_, i) => (period - i) * weight);
    const weightSum = weights.reduce((a, b) => a + b, 0);

    for (let i = period - 1; i < prices.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += prices[i - j] * weights[j];
        }
        result[i] = sum / weightSum;
    }

    return result;
}

function getPerformanceMetrics(startTime: number, initialMemory: number): PerformanceMetrics {
    const executionTime = performance.now() - startTime;
    const currentMemory = trackMemoryUsage();
    const memoryUsage = currentMemory - initialMemory;

    return {
        executionTime,
        memoryUsage,
        optimizationLevel: getOptimizationLevel(executionTime, memoryUsage)
    };
}

function getOptimizationLevel(executionTime: number, memoryUsage: number): 'high' | 'medium' | 'low' {
    // Threshold values based on empirical testing
    if (executionTime < 50 && memoryUsage < 1024 * 1024) { // Less than 50ms and 1MB
        return 'high';
    } else if (executionTime < 200 && memoryUsage < 5 * 1024 * 1024) { // Less than 200ms and 5MB
        return 'medium';
    }
    return 'low';
}