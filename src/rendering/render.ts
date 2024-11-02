import ArrowShader from "./shaders/arrow";
import BackgroundShader from "./shaders/background";
import RectShader from "./shaders/rect";
import { QUAD_INDICES, QUAD_POSITIONS } from "./webgl";

export const CELL_SIZE = 64;

export const ATLAS_TILE_SIZE = 512;

export class Render { // TODO: Optimize GPU usage
    private readonly gl: WebGLRenderingContext;

    private readonly positionBuffer: WebGLBuffer;
    private readonly indexBuffer: WebGLBuffer;

    private readonly arrowShader: ArrowShader;
    private readonly backgroundShader: BackgroundShader;
    private readonly rectShader: RectShader;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        this.gl.getExtension("OES_standard_derivatives");
        
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(QUAD_POSITIONS), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(QUAD_INDICES), this.gl.STATIC_DRAW);

        this.gl.colorMask(true, true, true, true);
        this.gl.clearColor(1, 1, 1, 1);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        this.arrowShader = new ArrowShader(this.gl);
        this.backgroundShader = new BackgroundShader(this.gl);
        this.rectShader = new RectShader(this.gl);

        this.arrowShader.use();
        gl.uniform1i(this.arrowShader.arrowAtlasUniform, 0);
        gl.uniform1i(this.arrowShader.medalAtlasUniform, 1);
    }

    destroy() {
        this.gl.deleteBuffer(this.positionBuffer);
        this.gl.deleteBuffer(this.indexBuffer);
        this.arrowShader.destroy();
        this.backgroundShader.destroy();
        this.rectShader.destroy();
        this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    }

    resize() {
        const canvas = this.gl.canvas as HTMLCanvasElement;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    drawBackground(offset: readonly [number, number], scale: number) {
        this.backgroundShader.use();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        this.gl.enableVertexAttribArray(this.backgroundShader.positionAttribute);
        this.gl.vertexAttribPointer(this.backgroundShader.positionAttribute, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.uniform4f(this.backgroundShader.transformUniform,
            offset[0] / scale / CELL_SIZE,
            offset[1] / scale / CELL_SIZE,
            this.gl.canvas.width / scale / CELL_SIZE,
            this.gl.canvas.height / scale / CELL_SIZE);

        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);

        this.gl.disableVertexAttribArray(this.backgroundShader.positionAttribute);
    }

    useArrowShader() {
        this.arrowShader.use();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        this.gl.enableVertexAttribArray(this.arrowShader.positionAttribute);
        this.gl.vertexAttribPointer(this.arrowShader.positionAttribute, 2, this.gl.FLOAT, false, 0, 0);
    }

    setArrowAlpha(alpha: number) {
        this.gl.uniform1f(this.arrowShader.alphaUniform, alpha);
    }

    drawArrow(offset: readonly [number, number], scale: number, type: number, medal: number, rotation: number, flipped: boolean, background: [number, number, number]) {
        this.gl.uniform4f(this.arrowShader.transformUniform,
            offset[0] / scale,
            offset[1] / scale,
            CELL_SIZE * scale / this.gl.canvas.width,
            CELL_SIZE * scale / this.gl.canvas.height);

        this.gl.uniform3f(this.arrowShader.backgroundUniform, background[0], background[1], background[2]);

        this.gl.uniform1i(this.arrowShader.arrowTypeUniform, type);
        this.gl.uniform1i(this.arrowShader.medalTypeUniform, medal);

        this.gl.uniform2f(this.arrowShader.rotationUniform, rotation * Math.PI / 2, +flipped);

        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }

    disableArrowShader() {
        this.gl.disableVertexAttribArray(this.arrowShader.positionAttribute);
    }

    drawRect(offset: readonly [number, number], size: readonly [number, number], color: [number, number, number]) {
        this.rectShader.use();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        this.gl.enableVertexAttribArray(this.rectShader.positionAttribute);
        this.gl.vertexAttribPointer(this.rectShader.positionAttribute, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.uniform4f(this.rectShader.transformUniform,
            offset[0] / this.gl.canvas.width,
            offset[1] / this.gl.canvas.height,
            size[0] / this.gl.canvas.width,
            size[1] / this.gl.canvas.height);

        this.gl.uniform3f(this.rectShader.colorUniform, color[0], color[1], color[2]);

        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);

        this.gl.disableVertexAttribArray(this.rectShader.positionAttribute);
    }
}