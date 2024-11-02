import { compileShader, createProgram } from "../webgl";

export abstract class Shader {
    protected readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;

    readonly positionAttribute: number;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = createProgram(gl,
            compileShader(gl, this.getVertexShader(), gl.VERTEX_SHADER),
            compileShader(gl, this.getFragmentShader(), gl.FRAGMENT_SHADER));
        this.positionAttribute = this.getAttribLocation("a_position");
    }

    abstract getVertexShader(): string;
    abstract getFragmentShader(): string;

    destroy() {
        this.gl.deleteProgram(this.program);
    }
    
    use() {
        this.gl.useProgram(this.program);
    }

    protected getAttribLocation(name: string) {
        return this.gl.getAttribLocation(this.program, name);
    }

    protected getUniformLocation(name: string) {
        return this.gl.getUniformLocation(this.program, name);
    }
}