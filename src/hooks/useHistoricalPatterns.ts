import { useState, useEffect } from 'react';
import { PatternAnalysis } from './usePatternRecognition';
import { PricePoint } from '../shared/constants';

interface HistoricalPattern extends PatternAnalysis {
    timestamp: number;
    accuracy: number;
}

export const useHistoricalPatterns = (windowSize: number = 30) => {
    const [history, setHistory] = useState<HistoricalPattern[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addPattern = (pattern: PatternAnalysis, pricePoint: PricePoint) => {
        setHistory(prev => {
            const newHistory = [...prev, {
                ...pattern,
                timestamp: pricePoint.timestamp,
                accuracy: calculateAccuracy(pattern, prev)
            }].slice(-windowSize);
            return newHistory;
        });
    };

    const calculateAccuracy = (currentPattern: PatternAnalysis, history: HistoricalPattern[]): number => {
        if (history.length === 0) return 1;
        
        const similarPatterns = history.filter(p => p.type === currentPattern.type);
        if (similarPatterns.length === 0) return 1;

        const accuracySum = similarPatterns.reduce((sum, p) => sum + p.accuracy, 0);
        return accuracySum / similarPatterns.length;
    };

    const getPatternStats = () => {
        if (history.length === 0) return null;

        const stats = history.reduce((acc, pattern) => {
            if (!acc[pattern.type]) {
                acc[pattern.type] = {
                    count: 0,
                    avgAccuracy: 0,
                    avgConfidence: 0
                };
            }
            acc[pattern.type].count++;
            acc[pattern.type].avgAccuracy += pattern.accuracy;
            acc[pattern.type].avgConfidence += pattern.confidence;
            return acc;
        }, {} as Record<string, { count: number; avgAccuracy: number; avgConfidence: number; }>);

        // Calculate averages
        Object.keys(stats).forEach(type => {
            stats[type].avgAccuracy /= stats[type].count;
            stats[type].avgConfidence /= stats[type].count;
        });

        return stats;
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return {
        history,
        addPattern,
        getPatternStats,
        clearHistory,
        loading,
        error
    };
};