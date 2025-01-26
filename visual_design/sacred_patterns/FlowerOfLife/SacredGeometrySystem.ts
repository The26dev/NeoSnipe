import { WebGLRenderer } from './WebGLRenderer';
import { vec2, mat4 } from 'gl-matrix';
import { GeometryData } from '../../../src/types/sacred-geometry/geometry-data.d';

interface PatternConfig {
  scale?: number;
  rotation?: number;
  segments?: number;
  complexity?: number;
  energyFlow?: boolean;
  colorPalette?: string[];
}

interface GeometryCache {
  [key: string]: {
    vertices: Float32Array;
    indices: Uint16Array;
    normals: Float32Array;
    timestamp: number;
  };
}

export class SacredGeometrySystem {
  private renderers: Map<string, WebGLRenderer> = new Map();
  private geometryCache: GeometryCache = {};
  private activePatterns: Set<string> = new Set();
  private animationFrame: number | null = null;
  private lastRenderTime: number = 0;
  
  constructor() {
    this.lastRenderTime = performance.now();
  }

  public addVisualization(canvasId: string, pattern: string, config: PatternConfig = {}): void {
    if (this.renderers.has(canvasId)) {
      console.warn(`Renderer already exists for canvas ${canvasId}`);
      return;
    }

    try {
      const renderer = new WebGLRenderer(canvasId);
      this.setupRenderer(renderer, pattern, config);
      this.renderers.set(canvasId, renderer);
      this.activePatterns.add(pattern);
    } catch (error) {
      console.error(`Failed to create visualization for ${pattern}:`, error);
      throw error;
    }
  }

  private setupRenderer(renderer: WebGLRenderer, pattern: string, config: PatternConfig): void {
    const geometryData = this.generateGeometry(pattern, config);
    renderer.setGeometryData(geometryData);
    
    // Apply configuration
    if (config.scale) renderer.setScale(config.scale);
    if (config.rotation) renderer.setRotation(config.rotation);
    if (config.colorPalette) renderer.setColorPalette(config.colorPalette);
    
    // Setup energy flow if enabled
    if (config.energyFlow) {
      renderer.enableEnergyFlow({
        intensity: 1.0,
        speed: 0.5,
        wavelength: 2.0
      });
    }
  }

  private generateGeometry(pattern: string, config: PatternConfig): GeometryData {
    const cacheKey = this.getCacheKey(pattern, config);
    const cached = this.geometryCache[cacheKey];
    
    if (cached && (performance.now() - cached.timestamp) < 5000) {
      return {
        vertices: cached.vertices,
        indices: cached.indices,
        normals: cached.normals
      };
    }

    const geometry = this.createPatternGeometry(pattern, config);
    
    // Cache the generated geometry
    this.geometryCache[cacheKey] = {
      ...geometry,
      timestamp: performance.now()
    };

    return geometry;
  }

  private createPatternGeometry(pattern: string, config: PatternConfig): GeometryData {
    const segments = config.segments || 64;
    const complexity = config.complexity || 1.0;
    
    switch (pattern.toLowerCase()) {
      case 'floweroflife':
        return this.createFlowerOfLife(segments, complexity);
      case 'sriyantra':
        return this.createSriYantra(segments, complexity);
      case 'metatronscube':
        return this.createMetatronsCube(segments, complexity);
      default:
        throw new Error(`Unknown pattern: ${pattern}`);
    }
  }

  private createFlowerOfLife(segments: number, complexity: number): GeometryData {
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    
    // Base circle
    const centerCircle = this.generateCircle(0, 0, 1, segments);
    vertices.push(...centerCircle.vertices);
    indices.push(...centerCircle.indices);
    normals.push(...centerCircle.normals);
    
    // Surrounding circles
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      
      const circle = this.generateCircle(x, y, 1, segments);
      const offset = vertices.length / 3;
      
      vertices.push(...circle.vertices);
      normals.push(...circle.normals);
      indices.push(...circle.indices.map(idx => idx + offset));
    }
    
    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices),
      normals: new Float32Array(normals)
    };
  }

  private generateCircle(centerX: number, centerY: number, radius: number, segments: number): {
    vertices: number[];
    indices: number[];
    normals: number[];
  } {
    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    
    // Center vertex
    vertices.push(centerX, centerY, 0);
    normals.push(0, 0, 1);
    
    // Circle vertices
    for (let i = 0; i <= segments; i++) {
      const angle = (i * Math.PI * 2) / segments;
      vertices.push(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle),
        0
      );
      normals.push(0, 0, 1);
      
      if (i < segments) {
        indices.push(0, i + 1, i + 2);
      }
    }
    
    return { vertices, indices, normals };
  }

  public startAnimation(): void {
    if (this.animationFrame !== null) return;
    
    const animate = (time: number) => {
      const deltaTime = time - this.lastRenderTime;
      this.lastRenderTime = time;
      
      this.renderers.forEach(renderer => {
        renderer.render(time);
      });
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  public stopAnimation(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  public dispose(): void {
    this.stopAnimation();
    this.renderers.forEach(renderer => renderer.dispose());
    this.renderers.clear();
    this.geometryCache = {};
    this.activePatterns.clear();
  }

  private getCacheKey(pattern: string, config: PatternConfig): string {
    return `${pattern}-${JSON.stringify(config)}`;
  }
}