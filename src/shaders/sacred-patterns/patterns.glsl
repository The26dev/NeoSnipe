// Vertex shader for sacred geometry patterns
export const PATTERN_VERTEX_SHADER = `
    attribute vec2 aPosition;
    attribute vec2 aTexCoord;
    
    uniform float uScale;
    uniform float uRotation;
    uniform float uTime;
    
    varying vec2 vTexCoord;
    
    void main() {
        float c = cos(uRotation);
        float s = sin(uRotation);
        mat2 rotation = mat2(c, -s, s, c);
        
        vec2 position = rotation * (aPosition * uScale);
        gl_Position = vec4(position, 0.0, 1.0);
        vTexCoord = aTexCoord;
    }
`;

// Fragment shaders for each pattern type
export const PENTAGRAM_FRAGMENT_SHADER = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform float uTime;
    
    void main() {
        float dist = length(vTexCoord - vec2(0.5));
        float glow = smoothstep(0.5, 0.4, dist);
        vec3 color = vec3(0.8, 0.6, 0.2) * glow;
        gl_FragColor = vec4(color, 1.0);
    }
`;

export const FIBONACCI_FRAGMENT_SHADER = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform float uTime;
    
    void main() {
        vec2 center = vTexCoord - vec2(0.5);
        float angle = atan(center.y, center.x);
        float radius = length(center);
        float spiral = fract(angle/6.28318 + radius * 2.0 + uTime * 0.1);
        float glow = smoothstep(0.1, 0.0, abs(spiral - 0.5));
        vec3 color = vec3(0.4, 0.6, 0.8) * glow;
        gl_FragColor = vec4(color, 1.0);
    }
`;

export const TORUS_FRAGMENT_SHADER = `
    precision mediump float;
    varying vec2 vTexCoord;
    uniform float uTime;
    
    void main() {
        vec2 center = vTexCoord - vec2(0.5);
        float radius = length(center);
        float ring = smoothstep(0.4, 0.35, abs(radius - 0.25));
        vec3 color = vec3(0.6, 0.4, 0.8) * ring;
        gl_FragColor = vec4(color, 1.0);
    }
`;