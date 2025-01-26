export interface WebGLMetrics {
    fps: number;
    frameTime: number;
    gpuMemoryUsage: number;
    shaderCompileTime: number;
    drawCalls: number;
    shaderSwitches?: number;
    bufferUploads?: number;
    textureUploads?: number;
    triangleCount?: number;
}

export interface ShaderError {
    type: 'compile' | 'link';
    message: string;
    source?: string;
    lineNumber?: number;
}