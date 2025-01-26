import { WebGLResourceManager } from '../webgl-resource-manager';

interface PooledBuffer {
  buffer: WebGLBuffer;
  size: number;
  inUse: boolean;
  lastUsed: number;
}

interface BufferRequest {
  size: number;
  usage: number;
}

/**
 * Manages a pool of WebGL vertex buffers for efficient resource reuse
 */
export class VertexBufferPool {
  private bufferPool: Map<string, PooledBuffer[]> = new Map();
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
   * Request a buffer from the pool or create a new one
   */
  requestBuffer(request: BufferRequest): WebGLBuffer {
    const key = this.getPoolKey(request.usage);
    const pool = this.bufferPool.get(key) || [];
    
    // Try to find a suitable buffer in the pool
    const availableBuffer = this.findAvailableBuffer(pool, request.size);
    if (availableBuffer) {
      availableBuffer.inUse = true;
      availableBuffer.lastUsed = Date.now();
      return availableBuffer.buffer;
    }

    // Create new buffer if none available
    return this.createNewBuffer(key, request);
  }

  /**
   * Release a buffer back to the pool
   */
  releaseBuffer(buffer: WebGLBuffer, usage: number): void {
    const key = this.getPoolKey(usage);
    const pool = this.bufferPool.get(key) || [];
    
    const bufferInfo = pool.find(b => b.buffer === buffer);
    if (bufferInfo) {
      bufferInfo.inUse = false;
      bufferInfo.lastUsed = Date.now();
    }
  }

  /**
   * Clean up unused buffers that exceed the pool size limit
   */
  private cleanup(): void {
    for (const [key, pool] of this.bufferPool.entries()) {
      if (pool.length > this.maxPoolSize) {
        // Sort by last used timestamp
        pool.sort((a, b) => b.lastUsed - a.lastUsed);
        
        // Remove oldest unused buffers
        const toRemove = pool.slice(this.maxPoolSize);
        toRemove.forEach(buffer => {
          if (!buffer.inUse) {
            this.resourceManager.deleteResource(buffer.buffer);
          }
        });
        
        // Update pool
        this.bufferPool.set(key, pool.slice(0, this.maxPoolSize));
      }
    }
  }

  private findAvailableBuffer(pool: PooledBuffer[], size: number): PooledBuffer | undefined {
    return pool.find(b => !b.inUse && b.size >= size);
  }

  private createNewBuffer(key: string, request: BufferRequest): WebGLBuffer {
    const buffer = this.resourceManager.createBuffer({
      size: request.size,
      usage: request.usage
    });

    const pool = this.bufferPool.get(key) || [];
    pool.push({
      buffer,
      size: request.size,
      inUse: true,
      lastUsed: Date.now()
    });
    
    this.bufferPool.set(key, pool);
    return buffer;
  }

  private getPoolKey(usage: number): string {
    return `buffer_${usage}`;
  }

  private startCleanupInterval(): void {
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Dispose of all buffers in the pool
   */
  dispose(): void {
    for (const [_, pool] of this.bufferPool.entries()) {
      pool.forEach(buffer => {
        this.resourceManager.deleteResource(buffer.buffer);
      });
    }
    this.bufferPool.clear();
  }
}