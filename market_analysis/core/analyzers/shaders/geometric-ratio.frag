#version 300 es
precision highp float;

in vec2 v_texCoord;

uniform sampler2D u_texture;
uniform float u_threshold;
uniform vec2 u_resolution;
uniform vec3 u_color;

out vec4 fragColor;

void main() {
    float ratio = texture(u_texture, v_texCoord).r;
    float intensity = step(u_threshold, ratio);
    fragColor = vec4(u_color * intensity, 1.0);
}