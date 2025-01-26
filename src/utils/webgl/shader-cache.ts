import { ShaderConfig } from '../../types/sacred-geometry';

interface ShaderCacheEntry {
  program: WebGLProgram;
  lastUsed: number;
}

export class ShaderCache {
  private gl: WebGLRenderingContext;
  private cache: Map<string, ShaderCacheEntry> = new Map();
  private lastCleanup: number = 0;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private readonly CACHE_LIFETIME = 300000; // 5 minutes

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  public getProgram(config: ShaderConfig): WebGLProgram {
    const key = this.getCacheKey(config);
    const cached = this.cache.get(key);

    if (cached) {
      cached.lastUsed = Date.now();
      return cached.program;
    }

    const program = this.createProgram(config);
    this.cache.set(key, {
      program,
      lastUsed: Date.now()
    });

    this.cleanupIfNeeded();
    return program;
  }

  private createProgram(config: ShaderConfig): WebGLProgram {
    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, config.vertexShader);
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, config.fragmentShader);

    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Failed to link shader program: ${error}`);
    }

    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);

    return program;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Failed to compile shader: ${error}`);
    }

    return shader;
  }

  private cleanupIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    this.lastCleanup = now;
    const expiredTime = now - this.CACHE_LIFETIME;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastUsed < expiredTime) {
        this.gl.deleteProgram(entry.program);
        this.cache.delete(key);
      }
    }
  }

  private getCacheKey(config: ShaderConfig): string {
    return `${config.vertexShader}:${config.fragmentShader}`;
  }

  public destroy(): void {
    for (const entry of this.cache.values()) {
      this.gl.deleteProgram(entry.program);
    }
    this.cache.clear();
  }
}