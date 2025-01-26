// Vertex Shader
#version 300 es
precision highp float;

in vec4 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vTextureCoord;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
}

// Fragment Shader
#version 300 es
precision highp float;

in vec2 vTextureCoord;
uniform sampler2D uPatternTexture;
uniform float uTime;

out vec4 fragColor;

void main() {
    vec2 uv = vTextureCoord;
    
    // Add time-based animation
    float pattern = sin(uv.x * 10.0 + uTime) * cos(uv.y * 10.0 + uTime);
    
    // Create sacred geometry pattern
    float circle = length(uv - 0.5);
    float flower = abs(sin(atan(uv.y - 0.5, uv.x - 0.5) * 6.0));
    
    vec4 patternColor = texture(uPatternTexture, uv);
    vec4 finalColor = mix(patternColor, vec4(flower, pattern, 1.0, 1.0), 0.5);
    
    fragColor = finalColor;
}