precision mediump float;

varying vec2 v_texcoord;

uniform vec4 u_transform;
uniform vec3 u_color;

void main() {
    gl_FragColor = vec4(u_color, 0.5);
}