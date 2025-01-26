import { WebGLResourceManager } from '../../../utils/webgl-resource-manager';
import { VertexBufferPool } from '../../../utils/webgl/VertexBufferPool';
import { TexturePool } from '../../../utils/webgl/TexturePool';
import { GeometryInstancing } from '../../../utils/webgl/GeometryInstancing';
import { PerformanceMonitor } from '../../../utils/webgl/PerformanceMonitor';
import { WebGLContextMock } from './WebGLContextMock';

interface BenchmarkResult {
  name: string;
  averageFps: number;
  memoryUsage: {
    peak: number;
    average: number;
  };
  resourceStats: {
    bufferCount: number;
    textureCount: number;
    instanceCount: number;
  };
  executionTime: number;
}

interface BenchmarkOptions {
  duration?: number;  // Duration in ms
  iterations?: number;
  warmupIterations?: number;
}

/**
 * Performance benchmarking system for WebGL resource management
 */
export class PerformanceBenchmark {
  private gl: WebGLContextMock;
  private resourceManager: WebGLResourceManager;
  private vertexBufferPool: VertexBufferPool;
  private texturePool: TexturePool;
  private geometryInstancing: GeometryInstancing;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.gl = new WebGLContextMock();
    this.resourceManager = new WebGLResourceManager(this.gl as unknown as WebGL2RenderingContext);
    this.vertexBufferPool = new VertexBufferPool(this.resourceManager);
    this.texturePool = new TexturePool(this.resourceManager);
    this.geometryInstancing = new GeometryInstancing(this.resourceManager, this.vertexBufferPool);
    this.performanceMonitor = new PerformanceMonitor(
      this.vertexBufferPool,
      this.texturePool,
      this.geometryInstancing
    );
  }

  /**
   * Run a benchmark test
   */
  async runBenchmark(
    name: string,
    testFn: () => void | Promise<void>,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult> {
    const {
      duration = 5000,
      iterations = 1000,
      warmupIterations = 100
    } = options;

    // Warmup phase
    for (let i = 0; i < warmupIterations; i++) {
      await testFn();
    }

    // Reset metrics before main test
    const startTime = performance.now();
    const metrics: PerformanceMetrics[] = [];

    // Main benchmark loop
    for (let i = 0; i < iterations && performance.now() - startTime < duration; i++) {
      await testFn();
      metrics.push(this.performanceMonitor.getCurrentMetrics());
    }

    const endTime = performance.now();

    return this.calculateResults(name, metrics, endTime - startTime);
  }

  /**
   * Benchmark buffer pool performance
   */
  async benchmarkBufferPool(bufferCount: number, bufferSize: number): Promise<BenchmarkResult> {
    return this.runBenchmark(
      'BufferPool Performance',
      () => {
        // Allocate buffers
        const buffers = Array(bufferCount).fill(0).map(() =>
          this.vertexBufferPool.requestBuffer({
            size: bufferSize,
            usage: this.gl.STATIC_DRAW
          })
        );

        // Release buffers
        buffers.forEach(buffer =>
          this.vertexBufferPool.releaseBuffer(buffer, this.gl.STATIC_DRAW)
        );
      }
    );
  }

  /**
   * Benchmark texture pool performance
   */
  async benchmarkTexturePool(textureCount: number, size: number): Promise<BenchmarkResult> {
    return this.runBenchmark(
      'TexturePool Performance',
      () => {
        // Allocate textures
        const textures = Array(textureCount).fill(0).map(() =>
          this.texturePool.requestTexture({
            width: size,
            height: size,
            format: this.gl.RGBA
          })
        );

        // Release textures
        textures.forEach(texture =>
          this.texturePool.releaseTexture(texture, this.gl.RGBA)
        );
      }
    );
  }

  /**
   * Benchmark geometry instancing performance
   */
  async benchmarkGeometryInstancing(
    instanceCount: number,
    verticesPerInstance: number
  ): Promise<BenchmarkResult> {
    const baseGeometry = new Float32Array(verticesPerInstance * 3); // x,y,z per vertex
    const instanceData = new Float32Array(instanceCount * 4); // x,y,z,scale per instance

    return this.runBenchmark(
      'Geometry Instancing Performance',
      () => {
        const instanceId = this.geometryInstancing.createInstance(
          baseGeometry,
          instanceData,
          [{
            location: 0,
            size: 4,
            type: this.gl.FLOAT,
            normalized: false,
            stride: 16,
            offset: 0
          }]
        );

        this.geometryInstancing.drawInstanced(
          this.gl,
          instanceId,
          this.gl.TRIANGLES,
          verticesPerInstance
        );

        this.geometryInstancing.deleteInstance(instanceId);
      }
    );
  }

  private calculateResults(
    name: string,
    metrics: PerformanceMetrics[],
    executionTime: number
  ): BenchmarkResult {
    const averageFps = metrics.reduce((sum, m) => sum + m.fps, 0) / metrics.length;

    const memoryUsages = metrics.map(m => m.memoryUsage.totalMemory);
    const peakMemory = Math.max(...memoryUsages);
    const averageMemory = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;

    const lastMetric = metrics[metrics.length - 1];

    return {
      name,
      averageFps,
      memoryUsage: {
        peak: peakMemory,
        average: averageMemory
      },
      resourceStats: {
        bufferCount: lastMetric.resourceCounts.buffers,
        textureCount: lastMetric.resourceCounts.textures,
        instanceCount: lastMetric.resourceCounts.instances
      },
      executionTime
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.vertexBufferPool.dispose();
    this.texturePool.dispose();
    this.geometryInstancing.dispose();
  }
}