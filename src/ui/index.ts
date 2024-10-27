import { Toolbar } from "./toolbar";
import { TPSSlider } from "./tps";

export class UI extends EventTarget {
    readonly toolbar: Toolbar;
    readonly slider: TPSSlider;

    constructor(parent: HTMLElement) {
        super();

        this.toolbar = new Toolbar(parent);
        this.slider = new TPSSlider(parent);
    }

    destroy() {
        this.toolbar.destroy();
        this.slider.destroy();
    }
}