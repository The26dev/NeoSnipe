export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private frameTimes: number[] = [];
  private readonly maxSamples: number = 60;
  private qualityReductionThreshold: number = 30;

  constructor() {
    this.lastTime = performance.now();
  }

  public update(time: number): void {
    const delta = time - this.lastTime;
    this.lastTime = time;

    // Update FPS calculation
    this.frameCount++;
    this.frameTimes.push(delta);
    
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }

    if (this.frameCount % 30 === 0) {
      const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
      this.fps = 1000 / averageFrameTime;
    }
  }

  public shouldReduceQuality(): boolean {
    return this.fps < this.qualityReductionThreshold;
  }

  public getFPS(): number {
    return Math.round(this.fps);
  }

  public getAverageFrameTime(): number {
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
  }

  public setQualityReductionThreshold(fps: number): void {
    this.qualityReductionThreshold = fps;
  }

  public reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
    this.frameTimes = [];
  }
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  qualityLevel: 'high' | 'medium' | 'low';
}

export class PerformanceOptimizer {
  private monitor: PerformanceMonitor;
  private currentQuality: 'high' | 'medium' | 'low' = 'high';
  private readonly fpsThresholds = {
    high: 50,
    medium: 30
  };

  constructor() {
    this.monitor = new PerformanceMonitor();
  }

  public update(time: number): void {
    this.monitor.update(time);
    this.adjustQuality();
  }

  private adjustQuality(): void {
    const fps = this.monitor.getFPS();
    
    if (fps < this.fpsThresholds.medium) {
      this.currentQuality = 'low';
    } else if (fps < this.fpsThresholds.high) {
      this.currentQuality = 'medium';
    } else {
      this.currentQuality = 'high';
    }
  }

  public getQualityLevel(): 'high' | 'medium' | 'low' {
    return this.currentQuality;
  }

  public getMetrics(): PerformanceMetrics {
    return {
      fps: this.monitor.getFPS(),
      frameTime: this.monitor.getAverageFrameTime(),
      qualityLevel: this.currentQuality
    };
  }

  public setFPSThresholds(high: number, medium: number): void {
    this.fpsThresholds.high = high;
    this.fpsThresholds.medium = medium;
  }
}