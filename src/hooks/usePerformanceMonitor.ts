import { useState, useEffect, useRef } from 'react';
import { WebGLPerformanceMonitor } from '../utils/webgl/performance-monitor';
import { WebGLMetrics } from '../utils/webgl/types';

export const usePerformanceMonitor = () => {
    const [metrics, setMetrics] = useState<WebGLMetrics | null>(null);
    const monitorRef = useRef<WebGLPerformanceMonitor | null>(null);
    const frameIdRef = useRef<number>(0);

    const startMonitoring = () => {
        if (!monitorRef.current) {
            monitorRef.current = new WebGLPerformanceMonitor();
        }
        
        const updateMetrics = () => {
            if (monitorRef.current) {
                monitorRef.current.startFrame();
                setMetrics(monitorRef.current.getMetrics());
                monitorRef.current.endFrame();
            }
            frameIdRef.current = requestAnimationFrame(updateMetrics);
        };

        frameIdRef.current = requestAnimationFrame(updateMetrics);
    };

    const stopMonitoring = () => {
        if (frameIdRef.current) {
            cancelAnimationFrame(frameIdRef.current);
        }
        if (monitorRef.current) {
            monitorRef.current.reset();
        }
        setMetrics(null);
    };

    useEffect(() => {
        return () => {
            stopMonitoring();
        };
    }, []);

    return {
        metrics,
        startMonitoring,
        stopMonitoring
    };
};