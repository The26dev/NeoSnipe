// Vertex Shader
#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;

out vec3 vNormal;
out vec2 vUv;
out float vTime;

void main() {
    vNormal = normal;
    vUv = position.xy * 0.5 + 0.5;
    vTime = time;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader
#version 300 es
precision highp float;

in vec3 vNormal;
in vec2 vUv;
in float vTime;

uniform vec3 baseColor;
uniform float energyIntensity;
uniform float energyFlow;

out vec4 fragColor;

float gold = 1.618033988749895;

vec3 energyPattern(vec2 uv, float time) {
    float wave = sin(uv.x * gold + time) * cos(uv.y * gold - time);
    float spiral = length(uv - 0.5) + sin(atan(uv.y - 0.5, uv.x - 0.5) * 6.0 + time);
    float energy = mix(wave, spiral, 0.5) * energyIntensity;
    
    return vec3(energy);
}

void main() {
    vec3 color = baseColor;
    
    if (energyFlow > 0.0) {
        vec3 energyColor = energyPattern(vUv, vTime * 0.001);
        color += energyColor * energyFlow;
    }
    
    float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
    color += fresnel * 0.5;
    
    fragColor = vec4(color, 1.0);
}