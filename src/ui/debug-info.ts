import { createElement } from "../dom";

export const FRACTION_DIGITS = 1;

export class DebugInfo {
    private readonly element: HTMLSpanElement;

    constructor(parent: HTMLElement) {
        this.element = createElement("span", "debug-info hidden");
        parent.appendChild(this.element);

        this.update(0, 0);
    }

    destroy() {
        this.element.remove();
    }

    update(tps: number, fps: number) {
        this.element.innerText = `FPS: ${fps.toFixed(FRACTION_DIGITS)}\n` +
                                 `TPS: ${tps.toFixed(FRACTION_DIGITS)}`;
    }

    toggle() {
        this.element.classList.toggle("hidden");
    }
}