import { PerformanceBenchmark } from '../../utils/webgl/PerformanceBenchmark';
import { WebGLResourceManager } from '../../utils/webgl-resource-manager';

describe('WebGL Performance Benchmarks', () => {
  let benchmark: PerformanceBenchmark;
  
  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
  });

  afterEach(() => {
    benchmark.dispose();
  });

  test('vertex buffer pooling performance', async () => {
    const result = await benchmark.benchmarkBufferPool(1000, 1024);
    expect(result.averageFrameTime).toBeLessThan(16.67); // 60fps target
    expect(result.memoryUsage).toBeLessThan(50 * 1024 * 1024); // 50MB limit
  });

  test('texture pooling performance', async () => {
    const result = await benchmark.benchmarkTexturePool(100, 512);
    expect(result.averageFrameTime).toBeLessThan(16.67);
    expect(result.memoryUsage).toBeLessThan(100 * 1024 * 1024); // 100MB limit
  });

  test('geometry instancing performance', async () => {
    const result = await benchmark.benchmarkGeometryInstancing(10000);
    expect(result.averageFrameTime).toBeLessThan(16.67);
    expect(result.drawCalls).toBeLessThan(100);
  });
});