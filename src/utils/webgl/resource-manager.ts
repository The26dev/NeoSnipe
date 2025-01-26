export class WebGLResourceManager {
    private gl: WebGL2RenderingContext;
    private buffers: Set<WebGLBuffer> = new Set();
    private textures: Set<WebGLTexture> = new Set();
    private shaders: Set<WebGLShader> = new Set();
    private programs: Set<WebGLProgram> = new Set();
    private frameBuffers: Set<WebGLFramebuffer> = new Set();

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public trackBuffer(buffer: WebGLBuffer): void {
        this.buffers.add(buffer);
    }

    public trackTexture(texture: WebGLTexture): void {
        this.textures.add(texture);
    }

    public trackShader(shader: WebGLShader): void {
        this.shaders.add(shader);
    }

    public trackProgram(program: WebGLProgram): void {
        this.programs.add(program);
    }

    public trackFrameBuffer(frameBuffer: WebGLFramebuffer): void {
        this.frameBuffers.add(frameBuffer);
    }

    public deleteBuffer(buffer: WebGLBuffer): void {
        if (this.buffers.has(buffer)) {
            this.gl.deleteBuffer(buffer);
            this.buffers.delete(buffer);
        }
    }

    public deleteTexture(texture: WebGLTexture): void {
        if (this.textures.has(texture)) {
            this.gl.deleteTexture(texture);
            this.textures.delete(texture);
        }
    }

    public deleteShader(shader: WebGLShader): void {
        if (this.shaders.has(shader)) {
            this.gl.deleteShader(shader);
            this.shaders.delete(shader);
        }
    }

    public deleteProgram(program: WebGLProgram): void {
        if (this.programs.has(program)) {
            this.gl.deleteProgram(program);
            this.programs.delete(program);
        }
    }

    public deleteFrameBuffer(frameBuffer: WebGLFramebuffer): void {
        if (this.frameBuffers.has(frameBuffer)) {
            this.gl.deleteFramebuffer(frameBuffer);
            this.frameBuffers.delete(frameBuffer);
        }
    }

    public cleanup(): void {
        // Delete all resources in reverse order of dependency
        this.frameBuffers.forEach(fb => this.deleteFrameBuffer(fb));
        this.programs.forEach(program => this.deleteProgram(program));
        this.shaders.forEach(shader => this.deleteShader(shader));
        this.textures.forEach(texture => this.deleteTexture(texture));
        this.buffers.forEach(buffer => this.deleteBuffer(buffer));

        // Clear all sets
        this.frameBuffers.clear();
        this.programs.clear();
        this.shaders.clear();
        this.textures.clear();
        this.buffers.clear();
    }
}