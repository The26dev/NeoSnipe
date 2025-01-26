// Mock Canvas and WebGL context for tests
class MockCanvas {
  getContext(): Partial<WebGLRenderingContext> {
    return {
      canvas: this,
      viewport: jest.fn(),
      clearColor: jest.fn(),
      clear: jest.fn(),
      enable: jest.fn(),
      createBuffer: jest.fn(() => ({})),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      createProgram: jest.fn(() => ({})),
      createShader: jest.fn(() => ({})),
      deleteBuffer: jest.fn(),
      deleteProgram: jest.fn(),
      deleteShader: jest.fn(),
      deleteTexture: jest.fn()
    };
  }
}

Object.defineProperty(global, 'HTMLCanvasElement', {
  value: MockCanvas
});

// Mock WebGL constants
const GL_CONSTANTS = {
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  COMPILE_STATUS: 35713,
  LINK_STATUS: 35714,
  COLOR_BUFFER_BIT: 16384,
  DEPTH_BUFFER_BIT: 256,
  DEPTH_TEST: 2929,
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
  STATIC_DRAW: 35044,
  TRIANGLE_STRIP: 5,
  FLOAT: 5126,
  GENERATE_MIPMAP_HINT: 33170,
  FASTEST: 4353
};

Object.defineProperty(global, 'WebGLRenderingContext', {
  value: {
    ...GL_CONSTANTS,
    prototype: {}
  }
});