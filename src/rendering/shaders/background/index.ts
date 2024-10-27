import { Shader } from "../shader";
import vert from "./background.vert";
import frag from "./background.frag";

export default class BackgroundShader extends Shader {
    readonly transformUniform: WebGLUniformLocation;

    constructor(gl: WebGLRenderingContext) {
        super(gl);
        this.transformUniform = this.getUniformLocation("u_transform");
    }

    getVertexShader() {
        return vert;
    }

    getFragmentShader() {
        return frag;
    }
}