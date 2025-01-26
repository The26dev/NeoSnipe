interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: {
    geometryBuffers: number;
    textureMemory: number;
    totalMemory: number;
  };
  resourceCounts: {
    buffers: number;
    textures: number;
    instances: number;
  };
}

interface MetricsHistory {
  timestamp: number;
  metrics: PerformanceMetrics;
}

/**
 * Monitors and tracks WebGL performance metrics
 */
export class PerformanceMonitor {
  private metricsHistory: MetricsHistory[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;
  private fpsUpdateInterval: number = 1000; // Update FPS every second
  private lastFpsUpdate: number = 0;
  private historyLimit: number = 3600; // Store 1 hour of history at 1 sample/second

  private vertexBufferPool: any; // Will be typed with VertexBufferPool
  private texturePool: any; // Will be typed with TexturePool
  private geometryInstancing: any; // Will be typed with GeometryInstancing

  constructor(
    vertexBufferPool: any,
    texturePool: any,
    geometryInstancing: any,
    historyLimit: number = 3600
  ) {
    this.vertexBufferPool = vertexBufferPool;
    this.texturePool = texturePool;
    this.geometryInstancing = geometryInstancing;
    this.historyLimit = historyLimit;
    this.startMonitoring();
  }

  /**
   * Update performance metrics for the current frame
   */
  updateMetrics(currentTime: number): void {
    // Calculate frame time
    const frameTime = this.lastFrameTime ? currentTime - this.lastFrameTime : 0;
    this.lastFrameTime = currentTime;
    
    // Update FPS counter
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = (this.frameCount * 1000) / (currentTime - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;

      // Record metrics
      this.recordMetrics({
        fps: this.fps,
        frameTime,
        memoryUsage: this.calculateMemoryUsage(),
        resourceCounts: this.getResourceCounts()
      });
    }
  }

  /**
   * Get the latest performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      frameTime: this.lastFrameTime,
      memoryUsage: this.calculateMemoryUsage(),
      resourceCounts: this.getResourceCounts()
    };
  }

  /**
   * Get performance metrics history
   */
  getMetricsHistory(): MetricsHistory[] {
    return this.metricsHistory;
  }

  /**
   * Calculate current memory usage
   */
  private calculateMemoryUsage() {
    // This is an estimate since actual GPU memory usage isn't directly accessible
    return {
      geometryBuffers: this.estimateBufferMemory(),
      textureMemory: this.estimateTextureMemory(),
      totalMemory: this.estimateBufferMemory() + this.estimateTextureMemory()
    };
  }

  /**
   * Get current resource counts
   */
  private getResourceCounts() {
    return {
      buffers: this.countActiveBuffers(),
      textures: this.countActiveTextures(),
      instances: this.countActiveInstances()
    };
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    // Monitor frame updates
    const monitorFrame = (timestamp: number) => {
      this.updateMetrics(timestamp);
      requestAnimationFrame(monitorFrame);
    };
    requestAnimationFrame(monitorFrame);
  }

  /**
   * Record metrics in history
   */
  private recordMetrics(metrics: PerformanceMetrics): void {
    this.metricsHistory.push({
      timestamp: Date.now(),
      metrics
    });

    // Maintain history limit
    if (this.metricsHistory.length > this.historyLimit) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Estimate buffer memory usage
   */
  private estimateBufferMemory(): number {
    // Implementation will depend on buffer pool implementation
    return 0; // Placeholder
  }

  /**
   * Estimate texture memory usage
   */
  private estimateTextureMemory(): number {
    // Implementation will depend on texture pool implementation
    return 0; // Placeholder
  }

  /**
   * Count active buffer resources
   */
  private countActiveBuffers(): number {
    // Implementation will depend on buffer pool implementation
    return 0; // Placeholder
  }

  /**
   * Count active texture resources
   */
  private countActiveTextures(): number {
    // Implementation will depend on texture pool implementation
    return 0; // Placeholder
  }

  /**
   * Count active geometry instances
   */
  private countActiveInstances(): number {
    // Implementation will depend on geometry instancing implementation
    return 0; // Placeholder
  }

  /**
   * Export current metrics for dashboard
   */
  exportMetrics(): string {
    return JSON.stringify({
      current: this.getCurrentMetrics(),
      history: this.metricsHistory
    }, null, 2);
  }
}