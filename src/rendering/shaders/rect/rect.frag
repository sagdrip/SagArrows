precision mediump float;

varying vec2 v_texcoord;

uniform vec4 u_transform;
uniform vec3 u_color;
uniform float u_border;

void main() {
    vec2 uv = abs(v_texcoord - 0.5);
    vec2 border = abs(u_transform.zw);
    border.x *= border.y / border.x;
    border = 0.5 - 0.004 / border;
    gl_FragColor = vec4(u_color, 0.5 + 0.5 * u_border * float(any(greaterThan(uv, border))));
}