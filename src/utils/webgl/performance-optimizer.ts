import { GeometryPattern } from '../../types/sacred-geometry';

interface BufferCache {
  vertices: WebGLBuffer;
  indices: WebGLBuffer;
  texCoords: WebGLBuffer;
  lastUsed: number;
}

export class WebGLPerformanceOptimizer {
  private gl: WebGLRenderingContext;
  private bufferCache: Map<string, BufferCache> = new Map();
  private textureCache: Map<string, WebGLTexture> = new Map();
  private lastCleanup: number = 0;
  private readonly CLEANUP_INTERVAL = 30000; // 30 seconds
  private readonly CACHE_LIFETIME = 60000; // 1 minute

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.setupOptimizations();
  }

  private setupOptimizations(): void {
    // Enable extensions for better performance
    this.gl.getExtension('WEBGL_lose_context');
    this.gl.getExtension('OES_vertex_array_object');
    this.gl.getExtension('OES_element_index_uint');

    // Set performance hints
    this.gl.hint(this.gl.GENERATE_MIPMAP_HINT, this.gl.FASTEST);
  }

  public optimizePattern(pattern: GeometryPattern): void {
    const cacheKey = this.getCacheKey(pattern);
    
    if (!this.bufferCache.has(cacheKey)) {
      this.createAndCacheBuffers(pattern, cacheKey);
    }

    this.bufferCache.get(cacheKey)!.lastUsed = Date.now();
    this.cleanupIfNeeded();
  }

  private createAndCacheBuffers(pattern: GeometryPattern, cacheKey: string): void {
    const { vertices, indices, textureCoords } = pattern.visualization;

    const vertexBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

    const indexBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

    const texCoordBuffer = this.gl.createBuffer()!;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoords), this.gl.STATIC_DRAW);

    this.bufferCache.set(cacheKey, {
      vertices: vertexBuffer,
      indices: indexBuffer,
      texCoords: texCoordBuffer,
      lastUsed: Date.now()
    });
  }

  private cleanupIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    this.lastCleanup = now;
    const expiredTime = now - this.CACHE_LIFETIME;

    // Cleanup buffers
    for (const [key, cache] of this.bufferCache.entries()) {
      if (cache.lastUsed < expiredTime) {
        this.gl.deleteBuffer(cache.vertices);
        this.gl.deleteBuffer(cache.indices);
        this.gl.deleteBuffer(cache.texCoords);
        this.bufferCache.delete(key);
      }
    }

    // Cleanup textures
    for (const [key, texture] of this.textureCache.entries()) {
      this.gl.deleteTexture(texture);
      this.textureCache.delete(key);
    }
  }

  private getCacheKey(pattern: GeometryPattern): string {
    return `${pattern.type}-${pattern.metrics.complexity}-${pattern.visualization.vertices.length}`;
  }

  public getBuffers(pattern: GeometryPattern): BufferCache | null {
    const cache = this.bufferCache.get(this.getCacheKey(pattern));
    if (cache) {
      cache.lastUsed = Date.now();
      return cache;
    }
    return null;
  }

  public destroy(): void {
    // Cleanup all resources
    for (const cache of this.bufferCache.values()) {
      this.gl.deleteBuffer(cache.vertices);
      this.gl.deleteBuffer(cache.indices);
      this.gl.deleteBuffer(cache.texCoords);
    }
    for (const texture of this.textureCache.values()) {
      this.gl.deleteTexture(texture);
    }
    this.bufferCache.clear();
    this.textureCache.clear();
  }
}