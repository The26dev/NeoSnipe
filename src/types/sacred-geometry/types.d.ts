export interface GeometryData {
  vertices: Float32Array;
  indices: Uint16Array;
  normals: Float32Array;
}

export interface PatternConfig {
  scale?: number;
  rotation?: number;
  segments?: number;
  complexity?: number;
  energyFlow?: boolean;
  colorPalette?: string[];
}

export interface AnimationConfig {
  energyFlow?: boolean;
  harmonicResonance?: boolean;
  transformations?: string[];
  renderQuality?: 'low' | 'medium' | 'high';
  optimizationLevel?: 'performance' | 'balanced' | 'quality';
  initialScale?: number;
}

export interface RenderOptions {
  antialias?: boolean;
  alpha?: boolean;
  preserveDrawingBuffer?: boolean;
  premultipliedAlpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
}

export interface EnergyFlowConfig {
  intensity: number;
  speed: number;
  wavelength: number;
}

export interface PerformanceMetrics {
  frameTime: number;
  drawCalls: number;
  triangleCount: number;
}

export interface TransformConfig {
  rotation?: number;
  scale?: number;
  translation?: [number, number];
  mirror?: boolean;
  recursive?: number;
}