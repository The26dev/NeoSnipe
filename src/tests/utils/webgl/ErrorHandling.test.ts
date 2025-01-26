import { WebGLResourceManager } from '../../../utils/webgl-resource-manager';
import { VertexBufferPool } from '../../../utils/webgl/VertexBufferPool';
import { TexturePool } from '../../../utils/webgl/TexturePool';
import { GeometryInstancing } from '../../../utils/webgl/GeometryInstancing';
import { WebGLContextMock } from './WebGLContextMock';

describe('WebGL Error Handling', () => {
  let gl: WebGLContextMock;
  let resourceManager: WebGLResourceManager;
  let bufferPool: VertexBufferPool;
  let texturePool: TexturePool;
  let geometryInstancing: GeometryInstancing;

  beforeEach(() => {
    gl = new WebGLContextMock();
    resourceManager = new WebGLResourceManager(gl as unknown as WebGL2RenderingContext);
    bufferPool = new VertexBufferPool(resourceManager);
    texturePool = new TexturePool(resourceManager);
    geometryInstancing = new GeometryInstancing(resourceManager, bufferPool);
  });

  afterEach(() => {
    bufferPool.dispose();
    texturePool.dispose();
    geometryInstancing.dispose();
  });

  describe('Context Loss Recovery', () => {
    beforeEach(() => {
      jest.spyOn(gl, 'isContextLost').mockReturnValue(true);
    });

    test('bufferPool handles context loss gracefully', () => {
      expect(() => {
        bufferPool.requestBuffer({
          size: 1024,
          usage: gl.STATIC_DRAW
        });
      }).not.toThrow();
    });

    test('texturePool handles context loss gracefully', () => {
      expect(() => {
        texturePool.requestTexture({
          width: 256,
          height: 256
        });
      }).not.toThrow();
    });

    test('geometryInstancing handles context loss gracefully', () => {
      const baseGeometry = new Float32Array(9);
      const instanceData = new Float32Array(16);
      
      expect(() => {
        geometryInstancing.createInstance(
          baseGeometry,
          instanceData,
          [{
            location: 0,
            size: 4,
            type: gl.FLOAT,
            normalized: false,
            stride: 16,
            offset: 0
          }]
        );
      }).not.toThrow();
    });
  });

  describe('Resource Allocation Failures', () => {
    test('handles buffer creation failure', () => {
      jest.spyOn(gl, 'createBuffer').mockReturnValue(null);

      expect(() => {
        bufferPool.requestBuffer({
          size: 1024,
          usage: gl.STATIC_DRAW
        });
      }).toThrow();
    });

    test('handles texture creation failure', () => {
      jest.spyOn(gl, 'createTexture').mockReturnValue(null);

      expect(() => {
        texturePool.requestTexture({
          width: 256,
          height: 256
        });
      }).toThrow();
    });

    test('recovers from partial resource allocation failure', () => {
      const mockCreateBuffer = jest.spyOn(gl, 'createBuffer');
      let callCount = 0;
      mockCreateBuffer.mockImplementation(() => {
        callCount++;
        return callCount % 2 === 0 ? null : { id: callCount } as WebGLBuffer;
      });

      // Should handle some allocations failing while others succeed
      const buffers: WebGLBuffer[] = [];
      for (let i = 0; i < 10; i++) {
        try {
          const buffer = bufferPool.requestBuffer({
            size: 1024,
            usage: gl.STATIC_DRAW
          });
          if (buffer) buffers.push(buffer);
        } catch (e) {
          // Expected for some allocations
        }
      }

      expect(buffers.length).toBeGreaterThan(0);
      expect(buffers.length).toBeLessThan(10);
    });
  });

  describe('Memory Limit Handling', () => {
    test('enforces buffer pool size limits', () => {
      const maxPoolSize = 3;
      const limitedPool = new VertexBufferPool(resourceManager, maxPoolSize);

      // Request more buffers than the pool size
      const buffers = Array(maxPoolSize + 2).fill(0).map(() =>
        limitedPool.requestBuffer({
          size: 1024,
          usage: gl.STATIC_DRAW
        })
      );

      // Release all buffers
      buffers.forEach(buffer => limitedPool.releaseBuffer(buffer, gl.STATIC_DRAW));

      // Force cleanup
      (limitedPool as any).cleanup();

      // Should have reduced to max pool size
      expect(gl._getBufferCount()).toBe(maxPoolSize);
    });

    test('enforces texture pool size limits', () => {
      const maxPoolSize = 3;
      const limitedPool = new TexturePool(resourceManager, maxPoolSize);

      // Request more textures than the pool size
      const textures = Array(maxPoolSize + 2).fill(0).map(() =>
        limitedPool.requestTexture({
          width: 256,
          height: 256
        })
      );

      // Release all textures
      textures.forEach(texture => limitedPool.releaseTexture(texture, gl.RGBA));

      // Force cleanup
      (limitedPool as any).cleanup();

      // Should have reduced to max pool size
      expect(gl._getTextureCount()).toBe(maxPoolSize);
    });

    test('handles out-of-memory scenarios', () => {
      // Mock an out-of-memory scenario
      const mockCreateBuffer = jest.spyOn(gl, 'createBuffer');
      mockCreateBuffer.mockImplementation(() => {
        throw new Error('Out of memory');
      });

      expect(() => {
        bufferPool.requestBuffer({
          size: 1024 * 1024 * 1024, // 1GB buffer to trigger OOM
          usage: gl.STATIC_DRAW
        });
      }).toThrow('Out of memory');
    });
  });
});