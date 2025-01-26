import { MemoryMonitor } from '../memory-monitor';
import { WebGLMetrics } from './types';

interface ExtendedWebGLMetrics extends WebGLMetrics {
    shaderSwitches: number;
    bufferUploads: number;
    textureUploads: number;
    triangleCount: number;
}

export class WebGLPerformanceMonitor {
    private static instance: WebGLPerformanceMonitor;
    private gl: WebGL2RenderingContext;
    private memoryMonitor: MemoryMonitor;
    private startTime: number = 0;
    private frameCount: number = 0;
    private lastFrameTime: number = 0;
    private metrics: ExtendedWebGLMetrics = {
        fps: 0,
        frameTime: 0,
        gpuMemoryUsage: 0,
        shaderCompileTime: 0,
        drawCalls: 0
    };

    public startFrame(): void {
        this.startTime = performance.now();
    }

    public endFrame(): void {
        const currentTime = performance.now();
        const frameDelta = currentTime - this.lastFrameTime;
        
        this.frameCount++;
        this.metrics.frameTime = currentTime - this.startTime;
        this.metrics.fps = 1000 / frameDelta;
        this.lastFrameTime = currentTime;
    }

    public trackShaderCompilation(duration: number): void {
        this.metrics.shaderCompileTime = duration;
    }

    public trackDrawCall(): void {
        this.metrics.drawCalls++;
    }

    public updateMemoryUsage(gl: WebGL2RenderingContext): void {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        if (ext) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                // Estimate memory usage based on bound buffers and textures
                this.metrics.gpuMemoryUsage = this.estimateMemoryUsage(gl);
            }
        }
    }

    private estimateMemoryUsage(gl: WebGL2RenderingContext): number {
        let totalMemory = 0;

        // Estimate buffer memory
        const buffers = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
        if (buffers) {
            totalMemory += gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);
        }

        // Estimate texture memory
        const textures = gl.getParameter(gl.TEXTURE_BINDING_2D);
        if (textures) {
            const width = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_WIDTH);
            const height = gl.getTexParameter(gl.TEXTURE_2D, gl.TEXTURE_HEIGHT);
            totalMemory += width * height * 4; // Assume 4 bytes per pixel
        }

        return totalMemory;
    }

    public getMetrics(): WebGLMetrics {
        return { ...this.metrics };
    }

    public reset(): void {
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.metrics = {
            fps: 0,
            frameTime: 0,
            gpuMemoryUsage: 0,
            shaderCompileTime: 0,
            drawCalls: 0
        };
    }
}