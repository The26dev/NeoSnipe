import { ShaderCache } from '../../utils/webgl/shader-cache';
import { ShaderConfig } from '../../types/sacred-geometry';

describe('ShaderCache', () => {
  let gl: WebGLRenderingContext;
  let shaderCache: ShaderCache;
  
  beforeEach(() => {
    // Mock WebGL context
    gl = {
      createShader: jest.fn(() => ({})),
      createProgram: jest.fn(() => ({})),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      getShaderParameter: jest.fn(() => true),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      getProgramParameter: jest.fn(() => true),
      deleteShader: jest.fn(),
      deleteProgram: jest.fn(),
      getShaderInfoLog: jest.fn(),
      getProgramInfoLog: jest.fn()
    } as unknown as WebGLRenderingContext;
    
    shaderCache = new ShaderCache(gl);
  });

  afterEach(() => {
    shaderCache.destroy();
  });

  test('creates and caches shader program', () => {
    const mockConfig: ShaderConfig = {
      vertexShader: 'vertex shader source',
      fragmentShader: 'fragment shader source',
      uniforms: {}
    };

    const program = shaderCache.getProgram(mockConfig);

    expect(program).toBeDefined();
    expect(gl.createShader).toHaveBeenCalledTimes(2);
    expect(gl.createProgram).toHaveBeenCalledTimes(1);
  });

  test('reuses cached shader program', () => {
    const mockConfig: ShaderConfig = {
      vertexShader: 'vertex shader source',
      fragmentShader: 'fragment shader source',
      uniforms: {}
    };

    const program1 = shaderCache.getProgram(mockConfig);
    const program2 = shaderCache.getProgram(mockConfig);

    expect(program1).toBe(program2);
    expect(gl.createProgram).toHaveBeenCalledTimes(1);
  });

  test('throws error on shader compilation failure', () => {
    (gl.getShaderParameter as jest.Mock).mockReturnValue(false);
    
    const mockConfig: ShaderConfig = {
      vertexShader: 'invalid shader',
      fragmentShader: 'fragment shader',
      uniforms: {}
    };

    expect(() => shaderCache.getProgram(mockConfig)).toThrow('Failed to compile shader');
  });

  test('throws error on program linking failure', () => {
    (gl.getProgramParameter as jest.Mock).mockReturnValue(false);
    
    const mockConfig: ShaderConfig = {
      vertexShader: 'vertex shader',
      fragmentShader: 'fragment shader',
      uniforms: {}
    };

    expect(() => shaderCache.getProgram(mockConfig)).toThrow('Failed to link shader program');
  });

  test('cleans up old shader programs', () => {
    jest.useFakeTimers();

    const config1: ShaderConfig = {
      vertexShader: 'shader1',
      fragmentShader: 'fragment1',
      uniforms: {}
    };

    shaderCache.getProgram(config1);
    
    jest.advanceTimersByTime(301000); // Past the cache lifetime
    
    const config2: ShaderConfig = {
      vertexShader: 'shader2',
      fragmentShader: 'fragment2',
      uniforms: {}
    };
    
    shaderCache.getProgram(config2);
    
    expect(gl.deleteProgram).toHaveBeenCalled();
    
    jest.useRealTimers();
  });
});