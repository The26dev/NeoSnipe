import { WebGLContext } from '../types/webgl';
import { initShader, createProgram } from '../utils/shader-utils';
import { WebGLPerformanceOptimizer } from '../utils/webgl/performance-optimizer';
import { ShaderCache } from '../utils/webgl/shader-cache';

interface PatternRecognitionConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

export class PatternRecognition {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private vertexPositionAttribute: number = -1;
  private textureCoordAttribute: number = -1;
  private config: PatternRecognitionConfig;
  private performanceOptimizer: WebGLPerformanceOptimizer;
  private shaderCache: ShaderCache;

  constructor(config: PatternRecognitionConfig) {
    this.config = config;
    this.gl = this.initializeWebGL();
    this.performanceOptimizer = new WebGLPerformanceOptimizer(this.gl);
    this.shaderCache = new ShaderCache(this.gl);
    this.initializeShaders();
    this.setupBuffers();
  }

  private initializeWebGL(): WebGLRenderingContext {
    const gl = this.config.canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL initialization failed');
    }

    gl.viewport(0, 0, this.config.width, this.config.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    return gl;
  }

  private initializeShaders(): void {
    const vertexShaderSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      
      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      
      varying vec2 vTextureCoord;
      
      void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      
      varying vec2 vTextureCoord;
      uniform float uTime;
      
      const float PI = 3.14159265359;
      const float PHI = 1.61803398875;
      
      float vesicaPiscis(vec2 uv, float scale) {
        vec2 center = vec2(0.5);
        float r = 0.5 / scale;
        float d1 = length(uv - (center + vec2(r, 0.0)));
        float d2 = length(uv - (center - vec2(r, 0.0)));
        return smoothstep(0.01, 0.0, abs(d1 + d2 - 2.0 * r));
      }
      
      float flowerOfLife(vec2 uv, float time) {
        float pattern = 0.0;
        vec2 center = vec2(0.5);
        
        for(float i = 0.0; i < 6.0; i++) {
          float angle = i * PI / 3.0 + time;
          vec2 offset = 0.2 * vec2(cos(angle), sin(angle));
          pattern += vesicaPiscis(uv - offset, 1.5);
        }
        
        return pattern;
      }
      
      void main() {
        vec2 uv = vTextureCoord;
        float time = uTime * 0.2;
        
        // Generate sacred geometry patterns
        float flower = flowerOfLife(uv, time);
        float spiral = fract(atan(uv.y - 0.5, uv.x - 0.5) / (2.0 * PI) + 
                           length(uv - 0.5) * 2.0 + time);
        
        // Combine patterns
        vec3 color = vec3(0.0);
        color += vec3(0.7, 0.3, 1.0) * flower;
        color += vec3(0.3, 0.7, 1.0) * spiral;
        
        // Add golden ratio-based pulsing
        float pulse = 0.5 + 0.5 * sin(time * PHI);
        color *= 0.7 + 0.3 * pulse;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const vertexShader = initShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = initShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    this.program = createProgram(this.gl, vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
  }

  private setupBuffers(): void {
    // Create and bind vertex buffer
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

    // Include texture coordinates with vertices
    const vertices = [
      // Position (x, y) and texture coordinates (u, v)
      -1.0, -1.0,   0.0, 0.0,
       1.0, -1.0,   1.0, 0.0,
      -1.0,  1.0,   0.0, 1.0,
       1.0,  1.0,   1.0, 1.0,
    ];

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      this.gl.STATIC_DRAW
    );
    
    // Store attribute locations
    this.vertexPositionAttribute = this.gl.getAttribLocation(this.program!, 'aVertexPosition');
    this.textureCoordAttribute = this.gl.getAttribLocation(this.program!, 'aTextureCoord');
    
    // Enable vertex attributes
    this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
    this.gl.enableVertexAttribArray(this.textureCoordAttribute);
  }

  public render(time: number = 0): void {
    if (!this.program) return;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Set up vertex attributes
    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
    this.gl.vertexAttribPointer(
      this.vertexPositionAttribute,
      2,
      this.gl.FLOAT,
      false,
      stride,
      0
    );
    
    this.gl.vertexAttribPointer(
      this.textureCoordAttribute,
      2,
      this.gl.FLOAT,
      false,
      stride,
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    // Update uniforms
    const timeLocation = this.gl.getUniformLocation(this.program, 'uTime');
    this.gl.uniform1f(timeLocation, time);

    // Draw the pattern
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }

  public destroy(): void {
    if (this.vertexBuffer) {
      this.gl.deleteBuffer(this.vertexBuffer);
    }
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
    this.performanceOptimizer.destroy();
    this.shaderCache.destroy();
  }
}