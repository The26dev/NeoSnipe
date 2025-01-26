// Common vertex shader for all patterns
export const COMMON_VERTEX_SHADER = `
  attribute vec4 aPosition;
  attribute vec2 aTexCoord;
  uniform float uScale;
  uniform float uRotation;
  varying vec2 vTexCoord;
  
  void main() {
    float c = cos(uRotation);
    float s = sin(uRotation);
    mat2 rotation = mat2(c, -s, s, c);
    vec2 rotated = rotation * aPosition.xy;
    gl_Position = vec4(rotated * uScale, 0.0, 1.0);
    vTexCoord = aTexCoord;
  }
`;

// Vesica Piscis shader
export const VESICA_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vTexCoord;
  uniform float uTime;
  
  void main() {
    vec2 center = vec2(0.5);
    float d = length(vTexCoord - center);
    
    // Create interference pattern
    float interference = sin(d * 30.0 - uTime) * 0.5 + 0.5;
    
    // Add pulsing glow
    float pulse = 0.5 + 0.5 * sin(uTime * 1.618);
    float glow = smoothstep(0.5, 0.0, d) * pulse;
    
    vec3 color = mix(
      vec3(0.4, 0.2, 0.8),
      vec3(0.2, 0.5, 1.0),
      interference
    );
    
    color = mix(color, vec3(1.0), glow);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Sri Yantra shader
export const SRI_YANTRA_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vTexCoord;
  uniform float uTime;
  
  void main() {
    vec2 center = vec2(0.5);
    float d = length(vTexCoord - center);
    
    // Create mandala-like pattern
    float angle = atan(vTexCoord.y - center.y, vTexCoord.x - center.x);
    float pattern = sin(angle * 9.0 + d * 20.0 - uTime);
    
    // Add pulsing energy field
    float pulse = 0.5 + 0.5 * sin(uTime * 1.618);
    float energy = smoothstep(0.5, 0.0, d) * pulse;
    
    vec3 color = mix(
      vec3(0.8, 0.2, 0.5),
      vec3(0.3, 0.1, 0.6),
      pattern * 0.5 + 0.5
    );
    
    color = mix(color, vec3(1.0, 0.9, 0.8), energy);
    gl_FragColor = vec4(color, 1.0);
  }
`;