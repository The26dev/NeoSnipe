import React, { createContext, useContext, useCallback, useRef } from 'react';
import { usePatternRecognition } from '../../hooks/usePatternRecognition';
import { useHistoricalPatterns } from '../../hooks/useHistoricalPatterns';
import { usePatternValidation } from '../../hooks/usePatternValidation';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { PatternAnalysis } from '../../hooks/usePatternRecognition';
import { PricePoint } from '../../shared/constants';
import { WebGLResourceManager } from '../../utils/webgl/resource-manager';

interface PatternRecognitionContextType {
    patterns: PatternAnalysis[];
    loading: boolean;
    error: string | null;
    analyzePatterns: (priceHistory: PricePoint[]) => Promise<void>;
    validatePattern: (pattern: PatternAnalysis) => void;
    historicalStats: Record<string, { count: number; avgAccuracy: number; avgConfidence: number; }> | null;
    metrics: WebGLMetrics | null;
    clearHistory: () => void;
}

const PatternRecognitionContext = createContext<PatternRecognitionContextType | null>(null);

export const usePatternRecognitionContext = () => {
    const context = useContext(PatternRecognitionContext);
    if (!context) {
        throw new Error('usePatternRecognitionContext must be used within a PatternRecognitionProvider');
    }
    return context;
};

interface Props {
    children: React.ReactNode;
}

export const PatternRecognitionProvider: React.FC<Props> = ({ children }) => {
    const resourceManagerRef = useRef<WebGLResourceManager | null>(null);
    
    const { 
        patterns, 
        loading, 
        error, 
        analyzePatterns 
    } = usePatternRecognition();

    const { 
        history, 
        addPattern, 
        getPatternStats, 
        clearHistory 
    } = useHistoricalPatterns();

    const { 
        validatePattern 
    } = usePatternValidation();

    const {
        metrics,
        startMonitoring,
        stopMonitoring
    } = usePerformanceMonitor();

    const handleAnalyzePatterns = useCallback(async (priceHistory: PricePoint[]) => {
        startMonitoring();
        await analyzePatterns(priceHistory);
        
        if (patterns.length > 0 && priceHistory.length > 0) {
            addPattern(patterns[0], priceHistory[priceHistory.length - 1]);
        }
    }, [analyzePatterns, patterns, addPattern, startMonitoring]);

    const handleClearHistory = useCallback(() => {
        clearHistory();
        stopMonitoring();
    }, [clearHistory, stopMonitoring]);

    return (
        <PatternRecognitionContext.Provider
            value={{
                patterns,
                loading,
                error,
                analyzePatterns: handleAnalyzePatterns,
                validatePattern,
                historicalStats: getPatternStats(),
                metrics,
                clearHistory: handleClearHistory
            }}
        >
            {children}
        </PatternRecognitionContext.Provider>
    );
};