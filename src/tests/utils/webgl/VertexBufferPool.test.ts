import { WebGLResourceManager } from '../../../utils/webgl-resource-manager';
import { VertexBufferPool } from '../../../utils/webgl/VertexBufferPool';
import { WebGLContextMock } from './WebGLContextMock';

describe('VertexBufferPool', () => {
  let gl: WebGLContextMock;
  let resourceManager: WebGLResourceManager;
  let bufferPool: VertexBufferPool;

  beforeEach(() => {
    gl = new WebGLContextMock();
    resourceManager = new WebGLResourceManager(gl as unknown as WebGL2RenderingContext);
    bufferPool = new VertexBufferPool(resourceManager);
  });

  afterEach(() => {
    bufferPool.dispose();
  });

  describe('Resource Management', () => {
    test('creates new buffer when pool is empty', () => {
      const buffer = bufferPool.requestBuffer({
        size: 1024,
        usage: gl.STATIC_DRAW
      });

      expect(buffer).toBeDefined();
      expect(gl._getBufferCount()).toBe(1);
    });

    test('reuses available buffer of sufficient size', () => {
      const buffer1 = bufferPool.requestBuffer({
        size: 1024,
        usage: gl.STATIC_DRAW
      });

      bufferPool.releaseBuffer(buffer1, gl.STATIC_DRAW);

      const buffer2 = bufferPool.requestBuffer({
        size: 512,
        usage: gl.STATIC_DRAW
      });

      expect(buffer2).toBe(buffer1);
      expect(gl._getBufferCount()).toBe(1);
    });

    test('creates new buffer when no suitable buffer is available', () => {
      const buffer1 = bufferPool.requestBuffer({
        size: 512,
        usage: gl.STATIC_DRAW
      });

      bufferPool.releaseBuffer(buffer1, gl.STATIC_DRAW);

      const buffer2 = bufferPool.requestBuffer({
        size: 1024,
        usage: gl.STATIC_DRAW
      });

      expect(buffer2).not.toBe(buffer1);
      expect(gl._getBufferCount()).toBe(2);
    });
  });

  describe('Cleanup', () => {
    test('disposes unused buffers when pool size is exceeded', () => {
      const maxPoolSize = 2;
      const poolWithLimit = new VertexBufferPool(resourceManager, maxPoolSize);

      const buffer1 = poolWithLimit.requestBuffer({
        size: 1024,
        usage: gl.STATIC_DRAW
      });

      const buffer2 = poolWithLimit.requestBuffer({
        size: 1024,
        usage: gl.STATIC_DRAW
      });

      const buffer3 = poolWithLimit.requestBuffer({
        size: 1024,
        usage: gl.STATIC_DRAW
      });

      poolWithLimit.releaseBuffer(buffer1, gl.STATIC_DRAW);
      poolWithLimit.releaseBuffer(buffer2, gl.STATIC_DRAW);
      poolWithLimit.releaseBuffer(buffer3, gl.STATIC_DRAW);

      // Force cleanup
      (poolWithLimit as any).cleanup();

      expect(gl._getBufferCount()).toBe(maxPoolSize);
    });
  });

  describe('Error Handling', () => {
    test('handles context loss gracefully', () => {
      jest.spyOn(gl, 'isContextLost').mockReturnValue(true);

      expect(() => {
        bufferPool.requestBuffer({
          size: 1024,
          usage: gl.STATIC_DRAW
        });
      }).not.toThrow();
    });
  });
});