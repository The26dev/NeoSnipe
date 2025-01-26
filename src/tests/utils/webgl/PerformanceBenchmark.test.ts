import { PerformanceBenchmark } from './PerformanceBenchmark';

describe('PerformanceBenchmark', () => {
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
  });

  afterEach(() => {
    benchmark.dispose();
  });

  describe('Buffer Pool Performance', () => {
    test('measures buffer allocation and release performance', async () => {
      const result = await benchmark.benchmarkBufferPool(1000, 1024);

      expect(result.name).toBe('BufferPool Performance');
      expect(result.averageFps).toBeGreaterThan(0);
      expect(result.memoryUsage.peak).toBeGreaterThan(0);
      expect(result.resourceStats.bufferCount).toBeLessThanOrEqual(1000);
    });

    test('handles high-frequency buffer recycling', async () => {
      const result = await benchmark.benchmarkBufferPool(100, 1024);

      // Should maintain good performance with buffer recycling
      expect(result.averageFps).toBeGreaterThan(30);
      expect(result.resourceStats.bufferCount).toBeLessThan(100);
    });
  });

  describe('Texture Pool Performance', () => {
    test('measures texture allocation and release performance', async () => {
      const result = await benchmark.benchmarkTexturePool(100, 256);

      expect(result.name).toBe('TexturePool Performance');
      expect(result.averageFps).toBeGreaterThan(0);
      expect(result.memoryUsage.peak).toBeGreaterThan(0);
      expect(result.resourceStats.textureCount).toBeLessThanOrEqual(100);
    });
  });

  describe('Geometry Instancing Performance', () => {
    test('measures instancing performance with large instance counts', async () => {
      const result = await benchmark.benchmarkGeometryInstancing(1000, 36);

      expect(result.name).toBe('Geometry Instancing Performance');
      expect(result.averageFps).toBeGreaterThan(0);
      expect(result.resourceStats.instanceCount).toBe(0); // Should be 0 after cleanup
    });
  });
});