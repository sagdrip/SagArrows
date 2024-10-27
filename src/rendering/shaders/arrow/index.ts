import { Shader } from "../shader";
import vert from "./arrow.vert";
import frag from "./arrow.frag";
import arrowAtlas from "../../../../res/atlas.png";
import medalAtlas from "../../../../res/medals.png";

export default class ArrowShader extends Shader {
    readonly arrowAtlasUniform: WebGLUniformLocation;
    readonly medalAtlasUniform: WebGLUniformLocation;
    readonly transformUniform: WebGLUniformLocation;
    readonly rotationUniform: WebGLUniformLocation;
    readonly backgroundUniform: WebGLUniformLocation;
    readonly arrowTypeUniform: WebGLUniformLocation;
    readonly medalTypeUniform: WebGLUniformLocation;
    readonly alphaUniform: WebGLUniformLocation;

    readonly arrowAtlasTexture: WebGLTexture;
    readonly medalAtlasTexture: WebGLTexture;

    constructor(gl: WebGLRenderingContext) {
        super(gl);
        this.arrowAtlasUniform = this.getUniformLocation("u_arrowAtlas");
        this.medalAtlasUniform = this.getUniformLocation("u_medalAtlas");
        this.transformUniform = this.getUniformLocation("u_transform");
        this.rotationUniform = this.getUniformLocation("u_rotation");
        this.backgroundUniform = this.getUniformLocation("u_background");
        this.arrowTypeUniform = this.getUniformLocation("u_arrowType");
        this.medalTypeUniform = this.getUniformLocation("u_medalType");
        this.alphaUniform = this.getUniformLocation("u_alpha");

        this.arrowAtlasTexture = gl.createTexture();
        const arrowAtlasImage = new Image();
        arrowAtlasImage.src = arrowAtlas;
        arrowAtlasImage.onload = () => {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.arrowAtlasTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, arrowAtlasImage);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
        };

        this.medalAtlasTexture = gl.createTexture();
        const medalAtlasImage = new Image();
        medalAtlasImage.src = medalAtlas;
        medalAtlasImage.onload = () => {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.medalAtlasTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, medalAtlasImage);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.generateMipmap(gl.TEXTURE_2D);
        };
    }

    getVertexShader() {
        return vert;
    }

    getFragmentShader() {
        return frag;
    }
}