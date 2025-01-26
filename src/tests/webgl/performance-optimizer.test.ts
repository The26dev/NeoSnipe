import { WebGLPerformanceOptimizer } from '../../utils/webgl/performance-optimizer';
import { GeometryPattern } from '../../types/sacred-geometry';

describe('WebGLPerformanceOptimizer', () => {
  let gl: WebGLRenderingContext;
  let optimizer: WebGLPerformanceOptimizer;
  
  beforeEach(() => {
    // Mock WebGL context
    gl = {
      createBuffer: jest.fn(() => ({})),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      deleteBuffer: jest.fn(),
      deleteTexture: jest.fn(),
      getExtension: jest.fn(),
      hint: jest.fn()
    } as unknown as WebGLRenderingContext;
    
    optimizer = new WebGLPerformanceOptimizer(gl);
  });

  afterEach(() => {
    optimizer.destroy();
  });

  test('creates and caches buffers for pattern', () => {
    const mockPattern: GeometryPattern = {
      type: 'flowerOfLife',
      metrics: {
        harmonicResonance: 1,
        symmetry: 1,
        complexity: 1,
        ratios: []
      },
      visualization: {
        vertices: [0, 0, 1, 1],
        indices: [0, 1, 2],
        textureCoords: [0, 0, 1, 1]
      },
      shaderConfig: {
        vertexShader: '',
        fragmentShader: '',
        uniforms: {}
      }
    };

    optimizer.optimizePattern(mockPattern);

    expect(gl.createBuffer).toHaveBeenCalledTimes(3); // Vertex, index, and texture coord buffers
    expect(gl.bindBuffer).toHaveBeenCalledTimes(3);
    expect(gl.bufferData).toHaveBeenCalledTimes(3);
  });

  test('reuses cached buffers for same pattern', () => {
    const mockPattern = {
      type: 'flowerOfLife',
      metrics: { complexity: 1 },
      visualization: {
        vertices: [0, 0],
        indices: [0],
        textureCoords: [0, 0]
      }
    } as GeometryPattern;

    optimizer.optimizePattern(mockPattern);
    const firstCallCount = (gl.createBuffer as jest.Mock).mock.calls.length;

    optimizer.optimizePattern(mockPattern);
    const secondCallCount = (gl.createBuffer as jest.Mock).mock.calls.length;

    expect(secondCallCount).toBe(firstCallCount);
  });

  test('cleans up old buffers', () => {
    jest.useFakeTimers();

    const mockPattern = {
      type: 'flowerOfLife',
      metrics: { complexity: 1 },
      visualization: {
        vertices: [0, 0],
        indices: [0],
        textureCoords: [0, 0]
      }
    } as GeometryPattern;

    optimizer.optimizePattern(mockPattern);
    
    jest.advanceTimersByTime(61000); // Past the cache lifetime
    
    optimizer.optimizePattern({ ...mockPattern, type: 'metatronsCube' });
    
    expect(gl.deleteBuffer).toHaveBeenCalled();
    
    jest.useRealTimers();
  });
});