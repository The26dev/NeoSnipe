export class WebGLContextManager {
    private readonly gl: WebGL2RenderingContext;
    private readonly extensionCache: Map<string, any> = new Map();
    private readonly contextAttributes: WebGLContextAttributes;

    constructor(gl: WebGL2RenderingContext, contextAttributes?: WebGLContextAttributes) {
        this.gl = gl;
        this.contextAttributes = {
            alpha: true,
            antialias: true,
            depth: true,
            failIfMajorPerformanceCaveat: true,
            powerPreference: 'high-performance',
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            stencil: true,
            ...contextAttributes
        };
    }

    public getExtension<T>(name: string): T | null {
        if (this.extensionCache.has(name)) {
            return this.extensionCache.get(name) as T;
        }

        const extension = this.gl.getExtension(name);
        if (extension) {
            this.extensionCache.set(name, extension);
        }

        return extension as T;
    }

    public async checkCapabilities(): Promise<{
        supportsWebGL2: boolean;
        maxTextureSize: number;
        maxTextureUnits: number;
        extensions: string[];
        vendor: string;
        renderer: string;
    }> {
        const debugInfo = this.getExtension('WEBGL_debug_renderer_info');
        
        return {
            supportsWebGL2: true,
            maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
            maxTextureUnits: this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
            extensions: this.gl.getSupportedExtensions() || [],
            vendor: debugInfo ? this.gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
            renderer: debugInfo ? this.gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown'
        };
    }

    public dispose(): void {
        this.extensionCache.clear();
        
        // Force context loss
        const loseContext = this.getExtension('WEBGL_lose_context');
        if (loseContext) {
            loseContext.loseContext();
        }

        // Clear all bound resources
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        // Unbind all texture units
        const maxTexUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        for (let i = 0; i < maxTexUnits; i++) {
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
        }
    }
}