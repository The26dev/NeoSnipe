import { WebGLResourceManager } from '../webgl-resource-manager';

interface PooledTexture {
  texture: WebGLTexture;
  width: number;
  height: number;
  format: number;
  inUse: boolean;
  lastUsed: number;
}

interface TextureRequest {
  width: number;
  height: number;
  format?: number;
  type?: number;
  minFilter?: number;
  magFilter?: number;
  generateMipmaps?: boolean;
}

/**
 * Manages a pool of WebGL textures for efficient resource reuse
 */
export class TexturePool {
  private texturePool: Map<string, PooledTexture[]> = new Map();
  private resourceManager: WebGLResourceManager;
  private maxPoolSize: number;
  private cleanupInterval: number;

  constructor(
    resourceManager: WebGLResourceManager,
    maxPoolSize: number = 50,
    cleanupInterval: number = 60000 // 1 minute
  ) {
    this.resourceManager = resourceManager;
    this.maxPoolSize = maxPoolSize;
    this.cleanupInterval = cleanupInterval;
    this.startCleanupInterval();
  }

  /**
   * Request a texture from the pool or create a new one
   */
  requestTexture(request: TextureRequest): WebGLTexture {
    const key = this.getPoolKey(request);
    const pool = this.texturePool.get(key) || [];

    // Try to find a suitable texture in the pool
    const availableTexture = this.findAvailableTexture(pool, request);
    if (availableTexture) {
      availableTexture.inUse = true;
      availableTexture.lastUsed = Date.now();
      return availableTexture.texture;
    }

    // Create new texture if none available
    return this.createNewTexture(key, request);
  }

  /**
   * Release a texture back to the pool
   */
  releaseTexture(texture: WebGLTexture, format: number): void {
    for (const [key, pool] of this.texturePool.entries()) {
      const textureInfo = pool.find(t => t.texture === texture);
      if (textureInfo) {
        textureInfo.inUse = false;
        textureInfo.lastUsed = Date.now();
        break;
      }
    }
  }

  /**
   * Clean up unused textures that exceed the pool size limit
   */
  private cleanup(): void {
    for (const [key, pool] of this.texturePool.entries()) {
      if (pool.length > this.maxPoolSize) {
        // Sort by last used timestamp
        pool.sort((a, b) => b.lastUsed - a.lastUsed);
        
        // Remove oldest unused textures
        const toRemove = pool.slice(this.maxPoolSize);
        toRemove.forEach(texture => {
          if (!texture.inUse) {
            this.resourceManager.deleteResource(texture.texture);
          }
        });
        
        // Update pool
        this.texturePool.set(key, pool.slice(0, this.maxPoolSize));
      }
    }
  }

  private findAvailableTexture(pool: PooledTexture[], request: TextureRequest): PooledTexture | undefined {
    return pool.find(t => 
      !t.inUse && 
      t.width >= request.width &&
      t.height >= request.height &&
      (!request.format || t.format === request.format)
    );
  }

  private createNewTexture(key: string, request: TextureRequest): WebGLTexture {
    const texture = this.resourceManager.createTexture({
      width: request.width,
      height: request.height,
      format: request.format,
      type: request.type,
      minFilter: request.minFilter,
      magFilter: request.magFilter,
      generateMipmaps: request.generateMipmaps
    });

    const pool = this.texturePool.get(key) || [];
    pool.push({
      texture,
      width: request.width,
      height: request.height,
      format: request.format || 0x1908, // Default to RGBA
      inUse: true,
      lastUsed: Date.now()
    });
    
    this.texturePool.set(key, pool);
    return texture;
  }

  private getPoolKey(request: TextureRequest): string {
    const format = request.format || 0x1908; // Default to RGBA
    return `texture_${format}`;
  }

  private startCleanupInterval(): void {
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Dispose of all textures in the pool
   */
  dispose(): void {
    for (const [_, pool] of this.texturePool.entries()) {
      pool.forEach(texture => {
        this.resourceManager.deleteResource(texture.texture);
      });
    }
    this.texturePool.clear();
  }
}