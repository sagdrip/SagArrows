precision mediump float;

attribute vec2 a_position;

varying vec2 v_texcoord;

void main() {
    v_texcoord = vec2(a_position.x, 1.0 - a_position.y);
    gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
}