import { vec2 } from 'gl-matrix';

export interface PostProcessingConfig {
  bloom?: {
    intensity: number;
    threshold: number;
    radius: number;
  };
  glow?: {
    intensity: number;
    color: [number, number, number];
  };
  noise?: {
    amount: number;
    scale: number;
    speed: number;
  };
}

export interface PostProcessingState {
  enabled: boolean;
  config: PostProcessingConfig;
  buffers: {
    bloomBuffer?: WebGLFramebuffer;
    glowBuffer?: WebGLFramebuffer;
  };
}

export class PostProcessor {
  private gl: WebGL2RenderingContext;
  private state: PostProcessingState;
  private shaderPrograms: Map<string, WebGLProgram>;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.state = {
      enabled: true,
      config: {
        bloom: {
          intensity: 0.8,
          threshold: 0.5,
          radius: 2.0
        },
        glow: {
          intensity: 0.5,
          color: [1, 1, 1]
        },
        noise: {
          amount: 0.05,
          scale: 1.0,
          speed: 0.5
        }
      },
      buffers: {}
    };
    this.shaderPrograms = new Map();
    
    this.initialize();
  }

  private initialize(): void {
    this.createShaderPrograms();
    this.setupBuffers();
  }

  private createShaderPrograms(): void {
    // Bloom shader
    const bloomVS = `#version 300 es
      precision highp float;
      in vec2 position;
      out vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const bloomFS = `#version 300 es
      precision highp float;
      uniform sampler2D tInput;
      uniform float intensity;
      uniform float threshold;
      uniform float radius;
      
      in vec2 vUv;
      out vec4 fragColor;
      
      void main() {
        vec4 color = texture(tInput, vUv);
        float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec3 bloomColor = color.rgb * smoothstep(threshold, 1.0, brightness);
        
        vec2 texelSize = 1.0 / vec2(textureSize(tInput, 0));
        vec3 blur = vec3(0.0);
        float total = 0.0;
        
        for (float x = -radius; x <= radius; x++) {
          for (float y = -radius; y <= radius; y++) {
            vec2 offset = vec2(x, y) * texelSize;
            float weight = 1.0 / (1.0 + length(offset) * 8.0);
            blur += texture(tInput, vUv + offset).rgb * weight;
            total += weight;
          }
        }
        
        blur /= total;
        fragColor = vec4(mix(color.rgb, blur * bloomColor, intensity), color.a);
      }
    `;

    const bloomProgram = this.createShaderProgram(bloomVS, bloomFS);
    if (bloomProgram) {
      this.shaderPrograms.set('bloom', bloomProgram);
    }
  }

  private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    const gl = this.gl;
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return null;
    
    gl.shaderSource(vertexShader, vertexSource);
    gl.shaderSource(fragmentShader, fragmentSource);
    
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader));
      return null;
    }
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
      return null;
    }
    
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program linking failed:', gl.getProgramInfoLog(program));
      return null;
    }
    
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    return program;
  }

  private setupBuffers(): void {
    const gl = this.gl;
    const width = gl.canvas.width;
    const height = gl.canvas.height;
    
    // Create bloom buffer
    const bloomBuffer = gl.createFramebuffer();
    const bloomTexture = gl.createTexture();
    
    if (bloomBuffer && bloomTexture) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomBuffer);
      gl.bindTexture(gl.TEXTURE_2D, bloomTexture);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, bloomTexture, 0);
      
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
        this.state.buffers.bloomBuffer = bloomBuffer;
      }
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  public process(inputTexture: WebGLTexture): void {
    if (!this.state.enabled) return;
    
    const gl = this.gl;
    
    // Apply bloom
    if (this.state.config.bloom && this.state.buffers.bloomBuffer) {
      const bloomProgram = this.shaderPrograms.get('bloom');
      if (bloomProgram) {
        gl.useProgram(bloomProgram);
        
        // Set uniforms
        const intensityLocation = gl.getUniformLocation(bloomProgram, 'intensity');
        const thresholdLocation = gl.getUniformLocation(bloomProgram, 'threshold');
        const radiusLocation = gl.getUniformLocation(bloomProgram, 'radius');
        
        gl.uniform1f(intensityLocation, this.state.config.bloom.intensity);
        gl.uniform1f(thresholdLocation, this.state.config.bloom.threshold);
        gl.uniform1f(radiusLocation, this.state.config.bloom.radius);
        
        // Bind input texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inputTexture);
        gl.uniform1i(gl.getUniformLocation(bloomProgram, 'tInput'), 0);
        
        // Draw
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.state.buffers.bloomBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }
  }

  public dispose(): void {
    const gl = this.gl;
    
    // Delete shader programs
    this.shaderPrograms.forEach(program => {
      gl.deleteProgram(program);
    });
    this.shaderPrograms.clear();
    
    // Delete buffers
    Object.values(this.state.buffers).forEach(buffer => {
      if (buffer) gl.deleteFramebuffer(buffer);
    });
    this.state.buffers = {};
  }

  public setConfig(config: Partial<PostProcessingConfig>): void {
    this.state.config = { ...this.state.config, ...config };
  }

  public isEnabled(): boolean {
    return this.state.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
  }
}