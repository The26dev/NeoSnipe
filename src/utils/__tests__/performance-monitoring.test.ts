import { monitorPerformance, measureAsyncOperation } from '../performance-monitor';

describe('Performance Monitoring', () => {
    it('should track synchronous operation performance', () => {
        const result = monitorPerformance(() => {
            // Simulate work
            let x = 0;
            for (let i = 0; i < 1000000; i++) {
                x += i;
            }
        });

        expect(result.endTime).toBeGreaterThan(result.startTime);
        expect(result.memoryUsage).toBeDefined();
        expect(result.cpuUsage).toBeGreaterThan(0);
    });

    it('should measure async operation performance', async () => {
        const { result, metrics } = await measureAsyncOperation(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'test';
        });

        expect(result).toBe('test');
        expect(metrics.endTime - metrics.startTime).toBeGreaterThanOrEqual(100);
        expect(metrics.memoryUsage).toBeDefined();
    });
});