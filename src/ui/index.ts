import { DebugInfo } from "./debug-info";
import { Toolbar } from "./toolbar";
import { TPSSlider } from "./tps";

export class UI extends EventTarget {
    readonly toolbar: Toolbar;
    readonly slider: TPSSlider;
    readonly debugInfo: DebugInfo;

    constructor(parent: HTMLElement) {
        super();

        this.toolbar = new Toolbar(parent);
        this.slider = new TPSSlider(parent);
        this.debugInfo = new DebugInfo(parent);
    }

    destroy() {
        this.toolbar.destroy();
        this.slider.destroy();
        this.debugInfo.destroy();
    }
}