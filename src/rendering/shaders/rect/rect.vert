precision mediump float;

attribute vec2 a_position;

varying vec2 v_texcoord;

uniform vec4 u_transform;

void main() {
    v_texcoord = a_position;
    gl_Position = vec4((u_transform.xy + a_position * u_transform.zw) * vec2(2.0, -2.0) + vec2(-1.0, 1.0), 0.0, 1.0);
}