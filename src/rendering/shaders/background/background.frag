#extension GL_OES_standard_derivatives : enable

precision mediump float;

varying vec2 v_texcoord;

uniform vec4 u_transform;

void main() {
    vec2 coord = vec2(1.0 - u_transform.x, 1.0 - u_transform.y) + v_texcoord * u_transform.zw;

    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord) * .6;
    float line = min(grid.x, grid.y);

    float color = min(line, 1.0);

    if (color > 0.8) {
        discard;
    }

    color = pow(color, 1.0 / 2.2);
    gl_FragColor = vec4(vec3(0.2 + color * 0.8), 1.0);
}