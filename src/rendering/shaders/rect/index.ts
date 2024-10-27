import { Shader } from "../shader";
import vert from "./rect.vert";
import frag from "./rect.frag";

export default class RectShader extends Shader {
    readonly transformUniform: WebGLUniformLocation;
    readonly colorUniform: WebGLUniformLocation;
    readonly borderUniform: WebGLUniformLocation;

    constructor(gl: WebGLRenderingContext) {
        super(gl);
        this.transformUniform = this.getUniformLocation("u_transform");
        this.colorUniform = this.getUniformLocation("u_color");
        this.borderUniform = this.getUniformLocation("u_border");
    }

    getVertexShader() {
        return vert;
    }

    getFragmentShader() {
        return frag;
    }
}