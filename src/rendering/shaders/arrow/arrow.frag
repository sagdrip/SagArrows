precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_arrowAtlas;
uniform sampler2D u_medalAtlas;
uniform vec4 u_transform;
uniform vec3 u_background;
uniform int u_arrowType;
uniform int u_medalType;
uniform float u_alpha;

void main() {
    vec2 texOffset = vec2((u_arrowType - 1) - (u_arrowType - 1) / 4 * 4, (u_arrowType - 1) / 4) / 4.0;
    vec4 color = float(u_arrowType > 0) * texture2D(u_arrowAtlas, texOffset + v_texcoord / 4.0);
    color = mix(color, vec4(u_background, 1.0), 1.0 - color.a);
    vec2 mtexOffset = vec2((u_medalType - 1) - (u_medalType - 1) / 4 * 4, (u_medalType - 1) / 4) / 4.0;
    vec4 medalTex = texture2D(u_medalAtlas, min(max(mtexOffset, mtexOffset + (v_texcoord - 0.3) / 4.0 * (1.0 / 0.4)), mtexOffset + 1.0 / 4.0));
    vec4 medalColor = vec4(0.941, 0.588, 0.196, 1.0) * (1.0 - smoothstep(0.2, 0.22, distance(v_texcoord, vec2(0.5))));
    medalColor = float(u_medalType > 0) * mix(medalTex, medalColor, 1.0 - medalTex.a);
    color = mix(medalColor, color, 1.0 - medalColor.a);
    color.a = u_alpha;
    gl_FragColor = color;
}