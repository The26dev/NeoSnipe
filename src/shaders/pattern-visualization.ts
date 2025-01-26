export const VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec3 a_patternData;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 v_color;

void main() {
    float x = (a_position.x / u_resolution.x) * 2.0 - 1.0;
    float y = (a_position.y / u_resolution.y) * 2.0 - 1.0;
    gl_Position = vec4(x, y, 0, 1);
    
    // Pattern coloring
    if (a_patternData.z > 0.5) {
        // Golden ratio pattern
        v_color = vec4(0.9, 0.7, 0.2, 1.0);
    } else {
        // Normal price point
        v_color = vec4(0.2, 0.6, 0.9, 1.0);
    }
    
    // Add time-based animation effect
    float alpha = sin(u_time * 2.0) * 0.3 + 0.7;
    v_color.a = alpha;
}`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec4 v_color;
out vec4 fragColor;

void main() {
    fragColor = v_color;
}`;