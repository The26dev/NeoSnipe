import { useState, useCallback } from 'react';
import { PatternRecognizer } from '../../market_analysis/core/analyzers/pattern_recognition';
import { PatternAnalysisResult, GeometricRatio } from '../../market_analysis/core/analyzers/pattern-types';
import { useWebGL } from './useWebGL';
import { PricePoint } from '../shared/constants';

export interface PatternAnalysis {
    type: string;
    probability: number;
    confidence: number;
    geometricRatios: GeometricRatio[];
    metadata: {
        computeTime: number;
        gpuAccelerated: boolean;
    };
}

export const usePatternRecognition = () => {
    const [patterns, setPatterns] = useState<PatternAnalysis[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { gl } = useWebGL();

    const recognizerRef = useRef<PatternRecognizer | null>(null);
    const resourceManagerRef = useRef<WebGLResourceManager | null>(null);
    const performanceMonitorRef = useRef<WebGLPerformanceMonitor | null>(null);

    useEffect(() => {
        if (gl) {
            resourceManagerRef.current = new WebGLResourceManager(gl);
            performanceMonitorRef.current = new WebGLPerformanceMonitor();
        }

        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.cleanup();
                recognizerRef.current = null;
            }
            if (resourceManagerRef.current) {
                resourceManagerRef.current.cleanup();
                resourceManagerRef.current = null;
            }
            if (performanceMonitorRef.current) {
                performanceMonitorRef.current.reset();
                performanceMonitorRef.current = null;
            }
        };
    }, [gl]);
    const recognizerRef = useRef<PatternRecognizer | null>(null);
    const resourceManagerRef = useRef<WebGLResourceManager | null>(null);
    const performanceMonitorRef = useRef<WebGLPerformanceMonitor | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const [patterns, setPatterns] = useState<PatternAnalysis[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { gl } = useWebGL();
    
    useEffect(() => {
        if (gl) {
            resourceManagerRef.current = new WebGLResourceManager(gl);
            performanceMonitorRef.current = new WebGLPerformanceMonitor();
        }
        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.cleanup();
                recognizerRef.current = null;
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const analyzePatterns = useCallback(async (priceHistory: PricePoint[]) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        if (!priceHistory || priceHistory.length === 0) {
            setError('Invalid price history data');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const recognizer = new PatternRecognizer(gl);
            const priceData = priceHistory.map(point => point.price);
            const result: PatternAnalysisResult = await recognizer.analyzePattern(priceData);
            
            setPatterns([{
                type: result.pattern.type,
                probability: result.pattern.probability,
                confidence: result.confidence,
                geometricRatios: result.geometricRatios,
                metadata: result.metadata
            }]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze patterns');
        } finally {
            setLoading(false);
        }
    }, [gl]);

    return {
        patterns,
        loading,
        error,
        analyzePatterns
    };
};