precision mediump float;

attribute vec2 a_position;

varying vec2 v_texcoord;

uniform vec4 u_transform;
uniform vec2 u_rotation;

mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

void main() {
    v_texcoord = vec2(u_rotation.y, 0.0) + ((a_position * 2.0 - 1.0) * rot(u_rotation.x) * 0.5 + 0.5) * vec2(1.0 - u_rotation.y * 2.0, 1.0);
    gl_Position = vec4((u_transform.xy + a_position) * u_transform.zw * vec2(2.0, -2.0) + vec2(-1.0, 1.0), 0.0, 1.0);
}