export class MemoryMonitor {
    private static instance: MemoryMonitor;
    private monitoring: boolean = false;
    private memoryUsage: number = 0;

    private constructor() {}

    public static getInstance(): MemoryMonitor {
        if (!MemoryMonitor.instance) {
            MemoryMonitor.instance = new MemoryMonitor();
        }
        return MemoryMonitor.instance;
    }

    public startMonitoring(): void {
        this.monitoring = true;
        this.updateMemoryUsage();
    }

    public stopMonitoring(): void {
        this.monitoring = false;
    }

    private updateMemoryUsage(): void {
        if (!this.monitoring) return;

        if (performance && 'memory' in performance) {
            this.memoryUsage = (performance as any).memory.usedJSHeapSize;
        }

        // Schedule next update
        setTimeout(() => this.updateMemoryUsage(), 1000);
    }

    public getMemoryUsage(): number {
        return this.memoryUsage;
    }
}