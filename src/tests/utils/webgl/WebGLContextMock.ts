/**
 * Mock implementation of WebGL2RenderingContext for testing
 */
export class WebGLContextMock implements Partial<WebGL2RenderingContext> {
  private buffers: Map<number, WebGLBuffer> = new Map();
  private textures: Map<number, WebGLTexture> = new Map();
  private nextBufferId = 1;
  private nextTextureId = 1;
  private boundBuffers: { [key: number]: WebGLBuffer | null } = {};
  private boundTextures: { [key: number]: WebGLTexture | null } = {};
  
  // WebGL constants
  readonly ARRAY_BUFFER = 0x8892;
  readonly ELEMENT_ARRAY_BUFFER = 0x8893;
  readonly STATIC_DRAW = 0x88E4;
  readonly DYNAMIC_DRAW = 0x88E8;
  readonly FLOAT = 0x1406;
  readonly RGBA = 0x1908;
  readonly TEXTURE_2D = 0x0DE1;
  readonly TEXTURE_MIN_FILTER = 0x2801;
  readonly TEXTURE_MAG_FILTER = 0x2800;
  readonly LINEAR = 0x2601;
  readonly NEAREST = 0x2600;

  // Buffer methods
  createBuffer(): WebGLBuffer {
    const buffer = { id: this.nextBufferId++ } as WebGLBuffer;
    this.buffers.set(buffer.id, buffer);
    return buffer;
  }

  deleteBuffer(buffer: WebGLBuffer): void {
    if (buffer) {
      this.buffers.delete(buffer.id);
      Object.keys(this.boundBuffers).forEach(key => {
        if (this.boundBuffers[key] === buffer) {
          this.boundBuffers[key] = null;
        }
      });
    }
  }

  bindBuffer(target: number, buffer: WebGLBuffer | null): void {
    this.boundBuffers[target] = buffer;
  }

  bufferData(target: number, data: BufferSource | null, usage: number): void {
    // Mock implementation
  }

  // Texture methods
  createTexture(): WebGLTexture {
    const texture = { id: this.nextTextureId++ } as WebGLTexture;
    this.textures.set(texture.id, texture);
    return texture;
  }

  deleteTexture(texture: WebGLTexture): void {
    if (texture) {
      this.textures.delete(texture.id);
      Object.keys(this.boundTextures).forEach(key => {
        if (this.boundTextures[key] === texture) {
          this.boundTextures[key] = null;
        }
      });
    }
  }

  bindTexture(target: number, texture: WebGLTexture | null): void {
    this.boundTextures[target] = texture;
  }

  texImage2D(
    target: number,
    level: number,
    internalformat: number,
    width: number,
    height: number,
    border: number,
    format: number,
    type: number,
    pixels: ArrayBufferView | null
  ): void {
    // Mock implementation
  }

  // Vertex attribute methods
  enableVertexAttribArray(index: number): void {
    // Mock implementation
  }

  vertexAttribPointer(
    index: number,
    size: number,
    type: number,
    normalized: boolean,
    stride: number,
    offset: number
  ): void {
    // Mock implementation
  }

  vertexAttribDivisor(index: number, divisor: number): void {
    // Mock implementation
  }

  // Drawing methods
  drawArrays(mode: number, first: number, count: number): void {
    // Mock implementation
  }

  drawArraysInstanced(mode: number, first: number, count: number, instanceCount: number): void {
    // Mock implementation
  }

  // State tracking methods
  isContextLost(): boolean {
    return false;
  }

  // Testing utilities
  _getBoundBuffer(target: number): WebGLBuffer | null {
    return this.boundBuffers[target] || null;
  }

  _getBoundTexture(target: number): WebGLTexture | null {
    return this.boundTextures[target] || null;
  }

  _getBufferCount(): number {
    return this.buffers.size;
  }

  _getTextureCount(): number {
    return this.textures.size;
  }
}