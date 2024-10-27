import { Arrow } from "./logic/arrow";
import { CHUNK_SIZE } from "./logic/chunk";
import { GameMap } from "./logic/game-map";
import { hash2chunkPos, hash2pos, pos2hash } from "./logic/pos2hash";
import { load, save } from "./logic/save";
import { PlayerSelection } from "./logic/selection";
import { Ticker } from "./logic/ticker";
import { sendSignal } from "./logic/utils";
import { CELL_SIZE, Render } from "./rendering/render";
import { UI } from "./ui";
import { ARROWS, MEDALS } from "./ui/toolbar";

export const SAVE_INTERVAL = 3000;

export class Game {
    private readonly gl: WebGLRenderingContext;
    private readonly render: Render;
    private readonly ui: UI;
    private readonly selection: PlayerSelection;
    private readonly map: GameMap;
    private readonly ticker: Ticker;
    private readonly resizeObserver: ResizeObserver;

    private saveInterval: number;

    private mousePosition: readonly [number, number] = [0, 0];

    private mouseStartPosition: readonly [number, number];
    private startOffset: readonly [number, number];
    private mouseDown: boolean;
    private wheelDown: boolean;

    private flipState?: boolean;
    private removeModeTouchedArrows: Set<Arrow> = new Set();

    private pressedKeys: Set<string> = new Set();

    private highlightedArrows: Set<bigint> = new Set();
    private highlightStartPosition?: readonly [number, number];
    private highlightSize?: readonly [number, number];

    private offset: readonly [number, number] = [0, 0];
    private scale: number = 1;

    constructor(parent: HTMLElement, gl: WebGLRenderingContext) {
        this.gl = gl;
        this.render = new Render(gl);
        this.ui = new UI(parent);
        this.ui.toolbar.addEventListener("select", (event: CustomEvent) => {
            switch (event.detail.section) {
                case 0:
                    this.selection.selectArrow(new Arrow(ARROWS.flat()[event.detail.item]));
                    break;
                case 1:
                    this.selection.selectMedal(MEDALS.flat()[event.detail.item]);
                    break;
                default:
                    this.selection.clear();
                    break;
            }
        });
        this.ui.slider.addEventListener("select", (event: CustomEvent) => {
            this.ticker.setTickRate(event.detail.value);
        });
        this.selection = new PlayerSelection();
        this.map = new GameMap();
        this.ticker = new Ticker(this.ui.slider.value, this.tickCallback, this.frameCallback, this.afterFrameCallback);
        this.resizeObserver = new ResizeObserver(() => this.render.resize());
    }
    
    start() {
        this.resizeObserver.observe(this.gl.canvas as HTMLCanvasElement);
        document.addEventListener("mousedown", this.onMouseDown);
        document.addEventListener("mouseup", this.onMouseUp);
        document.addEventListener("mousemove", this.onMouseMove);
        document.addEventListener("click", this.onClick);
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
        document.addEventListener("wheel", this.onWheel);
        document.addEventListener("copy", this.onCopy);
        document.addEventListener("paste", this.onPaste);
        document.addEventListener("cut", this.onCut);
        this.ticker.start();
        this.saveInterval = window.setInterval(() => this.save(), SAVE_INTERVAL);

        const saveCode = new URLSearchParams(location.search).get("save");
        if (saveCode)
            load(this.map, saveCode);
    }

    destroy() {
        this.ui.destroy();
        this.resizeObserver.disconnect();
        document.removeEventListener("mousedown", this.onMouseDown);
        document.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("click", this.onClick);
        document.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("keyup", this.onKeyUp);
        document.removeEventListener("wheel", this.onWheel);
        document.removeEventListener("copy", this.onCopy);
        document.removeEventListener("paste", this.onPaste);
        document.removeEventListener("cut", this.onCut);
        this.ticker.stop();
        window.clearInterval(this.saveInterval);
    }

    save() {
        const url = new URL(location.href);
        url.searchParams.set("save", save(this.map));
        history.pushState(null, "", url);
    }

    private readonly tickCallback = () => {
        this.update();
    };

    private readonly frameCallback = () => {
        this.updatePlayerInput();
    };

    private readonly afterFrameCallback = () => {
        this.draw();
    };

    
    private update() {
        this.map.chunks.forEach((chunk) => {
            for (let y = 0; y < CHUNK_SIZE; ++y)
                for (let x = 0; x < CHUNK_SIZE; ++x) {
                    const arrow = chunk.getArrow(x, y);
                    if (arrow.arrowType > 0 && arrow.active) {
                        if (arrow.arrowType === 1) {
                            sendSignal(chunk, arrow, x, y, 0, -1);
                        } else if (arrow.arrowType === 2) {
                            sendSignal(chunk, arrow, x, y, -1, 0);
                            sendSignal(chunk, arrow, x, y,  1, 0);
                        } else if (arrow.arrowType === 3) {
                            sendSignal(chunk, arrow, x, y,  0, -1);
                            sendSignal(chunk, arrow, x, y,  1,  0);
                        } else if (arrow.arrowType === 4) {
                            sendSignal(chunk, arrow, x, y, -1,  0);
                            sendSignal(chunk, arrow, x, y,  0, -1);
                            sendSignal(chunk, arrow, x, y,  1,  0);
                        } else if (arrow.arrowType === 5) {
                            sendSignal(chunk, arrow, x, y, -1,  0);
                            sendSignal(chunk, arrow, x, y,  1,  0);
                            sendSignal(chunk, arrow, x, y,  0, -1);
                            sendSignal(chunk, arrow, x, y,  0,  1);
                        } else if (arrow.arrowType === 6) {
                            sendSignal(chunk, arrow, x, y, 0, -2);
                        } else if (arrow.arrowType === 7) {
                            sendSignal(chunk, arrow, x, y, 1, -1);
                        } else if (arrow.arrowType === 8) {
                            sendSignal(chunk, arrow, x, y, 0, -1);
                            sendSignal(chunk, arrow, x, y, 1, -1);
                        } else if (arrow.arrowType === 9) {
                            sendSignal(chunk, arrow, x, y,  0, -2);
                            sendSignal(chunk, arrow, x, y,  1,  0);
                        } else if (arrow.arrowType === 10) {
                            sendSignal(chunk, arrow, x, y, -2, 0);
                            sendSignal(chunk, arrow, x, y,  1, 0);
                        } else if (arrow.arrowType === 11) {
                            sendSignal(chunk, arrow, x, y, 0, -1);
                            sendSignal(chunk, arrow, x, y, 0, -2);
                        } else if (arrow.arrowType === 12) {
                            sendSignal(chunk, arrow, x, y, 0,  0);
                            sendSignal(chunk, arrow, x, y, 0, -1);
                        } else if (arrow.arrowType === 13) {
                            sendSignal(chunk, arrow, x, y, -1, 0);
                            sendSignal(chunk, arrow, x, y,  0, 0);
                            sendSignal(chunk, arrow, x, y,  1, 0);
                        }
                    }
                }
        });
        this.map.chunks.forEach((chunk) => {
            for (let y = 0; y < CHUNK_SIZE; ++y)
                for (let x = 0; x < CHUNK_SIZE; ++x) {
                    const arrow = chunk.getArrow(x, y);
                    if (arrow.arrowType > 0) {
                        if (arrow.medalType === 0) {
                            arrow.active = arrow.signalCount > 0;
                        } else if (arrow.medalType === 1) {
                            arrow.active = true;
                        } else if (arrow.medalType === 2) {
                            arrow.active = arrow.signalCount === 0;
                        } else if (arrow.medalType === 3) {
                            arrow.active = arrow.signalCount >= 2;
                        } else if (arrow.medalType === 4) {
                            arrow.active = (arrow.signalCount % 2) === 1;
                        } else if (arrow.medalType === 5) {
                            if (arrow.signalCount > 0)
                                arrow.active = !arrow.active;
                        } else if (arrow.medalType === 6) {
                            if (arrow.signalCount > 0)
                                arrow.active = (arrow.signalCount % 2) === 0;
                        }
                        arrow.lastState = arrow.copyState();
                        arrow.signalCount = 0;
                    }
                }
        });
    }

    private updatePlayerInput() {
        const [mouseX, mouseY] = this.screenToWorld(...this.mousePosition);
        const arrow = this.map.getArrow(mouseX, mouseY);
        if (this.mouseDown) {
            if (this.selection.arrows) {
                this.selection.rotatedArrows.forEach((arrow, position) => {
                    const [arrowX, arrowY] = hash2pos(position);
                    this.map.getOrCreateArrow(mouseX + arrowX, mouseY + arrowY).merge(arrow);
                });
            } else if (this.selection.medal) {
                if (arrow && arrow.arrowType > 0)
                    arrow.medalType = this.selection.medal;
            }
        }
        if (arrow && arrow.arrowType > 0) {
            if (!this.selection.arrows) {
                if (this.isKeyPressed("KeyW"))      arrow.rotation = 0;
                else if (this.isKeyPressed("KeyA")) arrow.rotation = 1;
                else if (this.isKeyPressed("KeyS")) arrow.rotation = 2;
                else if (this.isKeyPressed("KeyD")) arrow.rotation = 3;
                else {
                    if (this.isKeyPressed("KeyF")) {
                        if (this.flipState === undefined) {
                            arrow.flipped = this.flipState = !arrow.flipped;
                        } else {
                            arrow.flipped = this.flipState;
                        }
                    } else {
                        this.flipState = undefined;
                    }
                }
            }
            if (this.isKeyPressed("KeyR")) {
                if (!this.removeModeTouchedArrows.has(arrow)) {
                    if (arrow.medalType !== 0) {
                        arrow.medalType = 0;
                    } else {
                        this.map.removeArrow(mouseX, mouseY);
                    }
                    this.removeModeTouchedArrows.add(arrow);
                }
            } else {
                this.removeModeTouchedArrows.clear();
            }
        }
        if (this.isKeyPressed("KeyE")) {
            if (!this.highlightStartPosition) {
                const mouseXRelative = this.mousePosition[0] - this.offset[0];
                const mouseYRelative = this.mousePosition[1] - this.offset[1];
                this.highlightStartPosition = [mouseXRelative, mouseYRelative];
                this.highlightSize = [0, 0];
            }
        } else {
            this.highlightStartPosition = undefined;
            this.highlightSize = undefined;
        }
    }

    private draw() {
        this.render.clear();

        this.render.useArrowShader();

        this.render.setArrowAlpha(1.0);

        const minX = ~~(-this.offset[0] / CELL_SIZE / CHUNK_SIZE) - 1;
        const minY = ~~(-this.offset[1] / CELL_SIZE / CHUNK_SIZE) - 1;
        const maxX = ~~(-this.offset[0] / CELL_SIZE / CHUNK_SIZE + this.gl.canvas.width / CHUNK_SIZE);
        const maxY = ~~(-this.offset[1] / CELL_SIZE / CHUNK_SIZE + this.gl.canvas.height / CHUNK_SIZE);
        this.map.chunks.forEach((chunk, position) => {
            const [chunkX, chunkY] = hash2chunkPos(position);
            if (!(chunkX >= minX && chunkX <= maxX && chunkY >= minY && chunkY <= maxY))
                return;
            const arrowOffsetX = this.offset[0] / CELL_SIZE;
            const arrowOffsetY = this.offset[1] / CELL_SIZE;
            for (let y = 0; y < CHUNK_SIZE; ++y)
                for (let x = 0; x < CHUNK_SIZE; ++x) {
                    const arrow = chunk.getArrow(x, y);
                    if (arrow.arrowType > 0) {
                        const xOffset = (chunkX * CHUNK_SIZE + x) + arrowOffsetX;
                        const yOffset = (chunkY * CHUNK_SIZE + y) + arrowOffsetY;
                        let color: [number, number, number];
                        if (arrow.active) color = [1, 0, 0];
                        else if (arrow.lastState.signalCount > 0) color = [.3, .5, 1];
                        else color = [1, 1, 1];
                        this.render.drawArrow([xOffset, yOffset], arrow.arrowType, arrow.medalType, arrow.rotation, arrow.flipped, color);
                    }
                }
        });

        this.render.setArrowAlpha(0.5);

        const [mouseX, mouseY] = this.screenToWorld(...this.mousePosition);
        if (this.selection.arrows) {
            this.selection.rotatedArrows.forEach((arrow, position) => {
                const [arrowX, arrowY] = hash2pos(position);
                if (!(mouseX + arrowX <= maxX && mouseY + arrowY <= maxY))
                    return;
                this.render.drawArrow(
                    [this.offset[0] / CELL_SIZE + mouseX + arrowX,
                     this.offset[1] / CELL_SIZE + mouseY + arrowY],
                    arrow.arrowType,
                    arrow.medalType,
                    arrow.rotation,
                    arrow.flipped,
                    [1, 1, 1]);
            });
        } else if (this.selection.medal) {
            this.render.drawArrow(
                [this.offset[0] / CELL_SIZE + mouseX,
                 this.offset[1] / CELL_SIZE + mouseY],
                0,
                this.selection.medal,
                0,
                false,
                [1, 1, 1]);
        }

        for (const hash of this.highlightedArrows) {
            const [arrowX, arrowY] = hash2pos(hash);
            this.render.drawRect(
                [arrowX * CELL_SIZE + this.offset[0], arrowY * CELL_SIZE + this.offset[1]],
                [CELL_SIZE, CELL_SIZE],
                [0.98, 0.784, 0.282],
                true
            );
        }

        this.render.drawBackground(this.offset);

        if (this.highlightStartPosition && this.highlightSize) {
            this.render.drawRect(
                [this.highlightStartPosition[0] + this.offset[0], this.highlightStartPosition[1] + this.offset[1]],
                this.highlightSize,
                [0.996, 0.957, 0.855],
                false
            );
        }
    }

    setScale(scale: number, center: [number, number]) {
        if (scale < 0.5)
            scale = 0.5;
        if (scale > 2)
            scale = 2;
        const centerX: number = center[0] * window.devicePixelRatio * this.scale - this.offset[0];
        const centerY: number = center[1] * window.devicePixelRatio * this.scale - this.offset[1];
        this.offset = [center[0] * window.devicePixelRatio * scale - centerX,
                       center[1] * window.devicePixelRatio * scale - centerY];
        this.scale = scale;
    }

    private screenToWorld(x: number, y: number) {
        const arrowX = (x - this.offset[0]) / CELL_SIZE;
        const arrowY = (y - this.offset[1]) / CELL_SIZE;
        return [~~arrowX - +(arrowX < 0), ~~arrowY - +(arrowY < 0)]
    }

    private isKeyPressed(code: string) {
        return this.pressedKeys.has(code);
    }

    private isShiftPressed() {
        return this.isKeyPressed("ShiftLeft") || this.isKeyPressed("ShiftRight");
    }

    private isCtrlPressed() {
        return this.isKeyPressed("ControlLeft") || this.isKeyPressed("ControlRight");
    }

    private readonly onMouseDown = (event: MouseEvent) => {
        if (event.target !== this.gl.canvas)
            return;
        if (event.button === 0) {
            this.mouseDown = true;
        } else if (event.button === 1) {
            this.mouseStartPosition = [event.clientX, event.clientY];
            this.startOffset = this.offset;
            this.wheelDown = true;
        }
    };

    private readonly onMouseUp = (event: MouseEvent) => {
        if (event.button === 0) {
            this.mouseDown = false;
        } else if (event.button === 1) {
            this.wheelDown = false;
        }
    };

    private readonly onMouseMove = (event: MouseEvent) => {
        this.mousePosition = [event.clientX, event.clientY];
        if (this.wheelDown) {
            this.offset = [this.startOffset[0] + event.clientX - this.mouseStartPosition[0],
                           this.startOffset[1] + event.clientY - this.mouseStartPosition[1]];
        }
        if (this.isKeyPressed("KeyE") && this.highlightStartPosition) {
            const mouseXRelative = this.mousePosition[0] - this.offset[0];
            const mouseYRelative = this.mousePosition[1] - this.offset[1];
            this.highlightSize = [mouseXRelative - this.highlightStartPosition[0], mouseYRelative - this.highlightStartPosition[1]];
            const isShiftPressed = this.isShiftPressed();
            const isCtrlPressed = this.isCtrlPressed();
            if (!isShiftPressed && !isCtrlPressed)
                this.highlightedArrows.clear();
            const [x1, y1] = this.screenToWorld(this.highlightStartPosition[0] + this.offset[0], this.highlightStartPosition[1] + this.offset[1]);
            const [x2, y2] = this.screenToWorld(...this.mousePosition);
            const minX = Math.min(x1, x2);
            const minY = Math.min(y1, y2);
            const maxX = Math.max(x1, x2);
            const maxY = Math.max(y1, y2);
            for (let y = minY; y <= maxY; ++y)
                for (let x = minX; x <= maxX; ++x) {
                    const arrow = this.map.getArrow(x, y);
                    if (arrow && arrow.arrowType > 0) {
                        const hash = pos2hash(x, y);
                        if (isCtrlPressed)
                            this.highlightedArrows.delete(hash);
                        else
                            this.highlightedArrows.add(hash);
                    }
                }
        }
    };

    private readonly onKeyDown = (event: KeyboardEvent) => {
        this.pressedKeys.add(event.code);
        const [arrowX, arrowY] = this.screenToWorld(...this.mousePosition);
        const arrow = this.map.getArrow(arrowX, arrowY);
        if (/^Digit[0-9]$/.test(event.code)) {
            this.ui.toolbar.selectItemOnCurrentPage(+event.code.at(-1));
        } else if (event.code === "Tab") {
            event.preventDefault();
            this.ui.toolbar.nextSection();
        } else if (event.code === "Backquote") {
            this.ui.toolbar.clearSelection();
        } else if (event.code === "KeyN") {
            this.map.chunks.forEach((chunk) => {
                for (let y = 0; y < CHUNK_SIZE; ++y)
                    for (let x = 0; x < CHUNK_SIZE; ++x) {
                        const arrow = chunk.getArrow(x, y);
                        arrow.signalCount = 0;
                        arrow.active = false;
                        arrow.lastState = arrow.copyState();
                    }
            });
        } else if (event.code === "Backspace") {
            if (this.highlightedArrows.size > 0) {
                for (const hash of this.highlightedArrows) {
                    const [arrowX, arrowY] = hash2pos(hash);
                    this.map.removeArrow(arrowX, arrowY);
                }
                this.highlightedArrows.clear();
            }
        } else if (event.code === "Space") {
            this.ticker.setPaused(!this.ticker.paused);
        } else if (event.code === "Enter") {
            if (this.ticker.paused)
                this.ticker.step();
        } else {
            if (this.selection.arrows) {
                if (event.code === "KeyW") {
                    this.selection.setRotation(0);
                } else if (event.code === "KeyA") {
                    this.selection.setRotation(1);
                } else if (event.code === "KeyS") {
                    this.selection.setRotation(2);
                } else if (event.code === "KeyD") {
                    this.selection.setRotation(3);
                } else if (event.code === "KeyF") {
                    this.selection.flip();
                }
            }
            if (arrow && arrow.arrowType !== 0) {
                if (event.code === "KeyQ") {
                    this.ui.toolbar.selectItem(0, arrow.arrowType - 1);
                    this.selection.selectArrow(arrow);
                }
            }
        }
    };

    private readonly onKeyUp = (event: KeyboardEvent) => {
        this.pressedKeys.delete(event.code);
    };

    private readonly onClick = (event: WheelEvent) => {
        if (event.target !== this.gl.canvas)
            return;
        if (this.selection.arrows || this.selection.medal)
            return;
        const [arrowX, arrowY] = this.screenToWorld(event.clientX, event.clientY);
        const arrow = this.map.getArrow(arrowX, arrowY);
        if (!arrow || arrow.arrowType === 0)
            return;
        arrow.active = !arrow.active;
    };

    private readonly onWheel = (event: WheelEvent) => {
        if (event.target !== this.gl.canvas)
            return;
        if (event.deltaY > 0) {
            // this.setScale(this.scale / 1.2, [event.clientX, event.clientY]);
        } else if (event.deltaY < 0) {
            // this.setScale(this.scale * 1.2, [event.clientX, event.clientY]);
        }
    };

    private copy(data: DataTransfer) {
        const tempMap = new GameMap();
        let minX = Infinity;
        let minY = Infinity;
        for (const hash of this.highlightedArrows) {
            const [arrowX, arrowY] = hash2pos(hash);
            if (arrowX < minX)
                minX = arrowX;
            if (arrowY < minY)
                minY = arrowY;
        }
        for (const hash of this.highlightedArrows) {
            const [arrowX, arrowY] = hash2pos(hash);
            tempMap.getOrCreateArrow(arrowX - minX, arrowY - minY).merge(this.map.getArrow(arrowX, arrowY));
        }
        console.log(save(tempMap));
        data.setData("text/plain", save(tempMap));
    }

    private readonly onCopy = (event: ClipboardEvent) => {
        if (this.highlightedArrows.size > 0) {
            event.preventDefault();
            this.copy(event.clipboardData);
            this.highlightedArrows.clear();
        }
    };

    private readonly onPaste = (event: ClipboardEvent) => {
        const data = event.clipboardData.getData("text/plain");
        if (!data)
            return;
        const tempMap = new GameMap();
        try {
            load(tempMap, data);
        } catch {
            return;
        }
        event.preventDefault();
        this.ui.toolbar.clearSelection();
        this.selection.selectArrows(tempMap);
    };

    private readonly onCut = (event: ClipboardEvent) => {
        if (this.highlightedArrows.size > 0) {
            event.preventDefault();
            this.copy(event.clipboardData);
            for (const hash of this.highlightedArrows) {
                const [arrowX, arrowY] = hash2pos(hash);
                this.map.removeArrow(arrowX, arrowY);
            }
            this.highlightedArrows.clear();
        }
    };
}