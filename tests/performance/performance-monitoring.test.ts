import { PerformanceMonitor } from '../../src/utils/performance/monitor';
import { MetricsCollector } from '../../src/utils/performance/metrics';
import { PerformanceReporter } from '../../src/utils/performance/reporter';

describe('Performance Monitoring System', () => {
  let monitor: PerformanceMonitor;
  let collector: MetricsCollector;
  let reporter: PerformanceReporter;

  beforeEach(() => {
    collector = new MetricsCollector();
    reporter = new PerformanceReporter();
    monitor = new PerformanceMonitor(collector, reporter);
  });

  afterEach(() => {
    monitor.stop();
  });

  test('collects frame timing metrics', async () => {
    monitor.start();
    
    // Simulate some rendering work
    for (let i = 0; i < 100; i++) {
      monitor.beginFrame();
      await new Promise(resolve => setTimeout(resolve, 16)); // Simulate 60fps
      monitor.endFrame();
    }
    
    const metrics = collector.getMetrics();
    expect(metrics.averageFrameTime).toBeLessThanOrEqual(17);
    expect(metrics.fps).toBeGreaterThanOrEqual(58);
  });

  test('tracks memory usage', () => {
    monitor.start();
    
    const metrics = collector.getMetrics();
    expect(metrics.memoryUsage).toBeDefined();
    expect(metrics.memoryUsage).toBeGreaterThan(0);
    expect(metrics.memoryUsage).toBeLessThan(200 * 1024 * 1024); // 200MB limit
  });

  test('reports performance regressions', async () => {
    const onRegression = jest.fn();
    reporter.onRegression(onRegression);
    
    monitor.start();
    
    // Simulate performance regression
    for (let i = 0; i < 10; i++) {
      monitor.beginFrame();
      await new Promise(resolve => setTimeout(resolve, 32)); // Simulate 30fps
      monitor.endFrame();
    }
    
    expect(onRegression).toHaveBeenCalled();
    const regressionEvent = onRegression.mock.calls[0][0];
    expect(regressionEvent.type).toBe('frame_time');
    expect(regressionEvent.value).toBeGreaterThan(30);
  });

  test('handles high load scenarios', async () => {
    monitor.start();
    
    // Simulate high load
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(
        (async () => {
          monitor.beginFrame();
          await new Promise(resolve => setTimeout(resolve, 1));
          monitor.endFrame();
        })()
      );
    }
    
    await Promise.all(promises);
    
    const metrics = collector.getMetrics();
    expect(metrics.dropped_frames).toBeDefined();
    expect(metrics.maxFrameTime).toBeDefined();
  });

  test('generates performance reports', () => {
    monitor.start();
    
    // Simulate some activity
    for (let i = 0; i < 10; i++) {
      monitor.beginFrame();
      monitor.endFrame();
    }
    
    const report = reporter.generateReport();
    
    expect(report).toHaveProperty('summary');
    expect(report).toHaveProperty('details');
    expect(report.summary).toHaveProperty('averageFps');
    expect(report.summary).toHaveProperty('memoryTrend');
    expect(report.details).toHaveProperty('timelineEvents');
  });
});