export interface GeometryData {
  points: number[][];
  angles: number[];
  distances: number[];
  center?: [number, number];
  scale?: number;
}

export type PatternType = 'flowerOfLife' | 'metatronsCube' | 'vesicaPiscis' | 'sriYantra' | 'unknown';

export interface ShaderConfig {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, any>;
}

export interface SacredGeometryError extends Error {
  code: string;
  details?: Record<string, any>;
}

export interface GeometryPattern {
  type: PatternType;
  metrics: {
    harmonicResonance: number;
    symmetry: number;
    complexity: number;
    ratios: number[];
  };
  visualization: {
    vertices: number[];
    indices: number[];
    textureCoords: number[];
  };
  shaderConfig: ShaderConfig;
}

export interface PatternAnalysisResult {
  pattern: GeometryPattern;
  confidence: number;
  matchedFeatures: string[];
  timeSeriesCorrelation?: number;
}