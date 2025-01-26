export interface GeometricRatio {
    ratio: number;
    significance: number;
}

export interface HarmonicPattern {
    name: string;
    probability: number;
    pivotPoints: number[];
}

export interface WaveCycleAnalysis {
    probability: number;
    waveCount: number;
    isComplete: boolean;
    currentWave: number;
}

export interface PatternIdentificationResult {
    type: string;
    probability: number;
    confidence: number;
}

export interface PatternCandidate {
    type: string;
    probability: number;
}

export interface PatternAnalysisResult {
    pattern: PatternIdentificationResult;
    confidence: number;
    geometricRatios: GeometricRatio[];
    metadata: {
        computeTime: number;
        gpuAccelerated: boolean;
    };
}