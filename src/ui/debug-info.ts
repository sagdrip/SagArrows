import { createElement } from "../dom";

export const FRACTION_DIGITS = 1;

export class DebugInfo {
    private readonly element: HTMLSpanElement;

    constructor(parent: HTMLElement) {
        this.element = createElement("span", "debug-info hidden");
        parent.appendChild(this.element);

        this.update(0, 0, "N/A");
    }

    destroy() {
        this.element.remove();
    }

    update(tps: number, fps: number, updateSystem: string) {
        this.element.innerText = `FPS: ${fps.toFixed(FRACTION_DIGITS)}\n` +
                                 `TPS: ${tps.toFixed(FRACTION_DIGITS)}\n` +
                                 `Update system: ${updateSystem}`;
    }

    toggle() {
        this.element.classList.toggle("hidden");
    }
}