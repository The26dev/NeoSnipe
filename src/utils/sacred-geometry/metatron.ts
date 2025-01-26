import { TAU } from './geometry';

export const generateMetatronPoints = (scale: number): number[][] => {
  const points: number[][] = [];
  const centerPoint = [0, 0];
  
  // Add center point
  points.push(centerPoint);
  
  // Add inner hexagon points
  const innerRadius = 0.4 * scale;
  for (let i = 0; i < 6; i++) {
    const angle = i * TAU / 6;
    points.push([
      Math.cos(angle) * innerRadius,
      Math.sin(angle) * innerRadius
    ]);
  }
  
  // Add outer hexagon points
  const outerRadius = 0.8 * scale;
  for (let i = 0; i < 6; i++) {
    const angle = (i + 0.5) * TAU / 6;
    points.push([
      Math.cos(angle) * outerRadius,
      Math.sin(angle) * outerRadius
    ]);
  }
  
  return points;
};

// Shader constants for Metatron's Cube
export const METATRON_VERTEX_SHADER = `
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

export const METATRON_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vTexCoord;
  uniform float uTime;
  
  void main() {
    vec2 center = vec2(0.5);
    float d = length(vTexCoord - center);
    
    // Create pulsing glow effect
    float pulse = 0.5 + 0.5 * sin(uTime * 1.618);
    float glow = smoothstep(0.5, 0.0, d) * pulse;
    
    // Create geometric patterns
    float pattern = abs(sin(d * 20.0 - uTime));
    
    vec3 color = mix(
      vec3(0.2, 0.4, 1.0),
      vec3(0.9, 0.3, 0.8),
      pattern
    );
    
    color = mix(color, vec3(1.0), glow);
    gl_FragColor = vec4(color, 1.0);
  }
`;