precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_arrowAtlas;
uniform sampler2D u_medalAtlas;
uniform vec4 u_transform;
uniform vec3 u_background;
uniform int u_arrowType;
uniform int u_medalType;
uniform float u_alpha;

int tileCount = 16;
float tileSize = 1.0 / float(tileCount);

void main() {
    vec2 texOffset = vec2((u_arrowType - 1) - (u_arrowType - 1) / tileCount * tileCount, (u_arrowType - 1) / tileCount) * tileSize;
    vec4 color = float(u_arrowType > 0) * texture2D(u_arrowAtlas, texOffset + v_texcoord * tileSize);
    color = mix(color, vec4(u_background, 1.0), 1.0 - color.a);
    vec2 mtexOffset = vec2((u_medalType - 1) - (u_medalType - 1) / tileCount * tileCount, (u_medalType - 1) / tileCount) * tileSize;
    float medalAlpha = 1.0 - smoothstep(0.2, 0.22, distance(v_texcoord, vec2(0.5)));
    vec2 medalUv = (v_texcoord - 0.3) * tileSize * (1.0 / 0.4);
    vec4 medalTex = texture2D(u_medalAtlas, mtexOffset + medalUv);
    medalTex.a *= medalAlpha;
    vec4 medalColor = vec4(0.941, 0.588, 0.196, medalAlpha);
    medalColor = float(u_medalType > 0) * mix(medalTex, medalColor, 1.0 - medalTex.a);
    color = mix(medalColor, color, 1.0 - medalColor.a);
    color.a = u_alpha;
    gl_FragColor = color;
}