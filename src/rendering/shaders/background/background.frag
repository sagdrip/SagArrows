#extension GL_OES_standard_derivatives : enable

precision mediump float;

varying vec2 v_texcoord;

uniform vec4 u_transform;

float gridThickness = .08;

float filterWidth2(vec2 uv) {
    vec2 dx = dFdx(uv), dy = dFdy(uv);
    return dot(dx, dx) + dot(dy, dy) + .0001;
}

float gridSmooth(vec2 p) {
    vec2 q = p;
    q += .5;
    q -= floor(q);
    q = (gridThickness + 1.) * .5 - abs(q - .5);
    float w = 12. * filterWidth2(p);
    float s = sqrt(gridThickness);
    return smoothstep(.5 - w * s, .5 + w, max(q.x, q.y));
}

void main() {
    vec2 coord = vec2(1.0 - u_transform.x, 1.0 - u_transform.y) + v_texcoord * u_transform.zw;

    gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0) * gridSmooth(coord);
}