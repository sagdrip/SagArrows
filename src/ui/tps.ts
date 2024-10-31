import { createElement } from "../dom";

export const TPS_VALUES = [2, 16, 64, 256, 1024, 4096, 16384, 65536];

export class TPSSlider extends EventTarget {
    private readonly element: HTMLDivElement;
    private readonly thumb: HTMLDivElement;

    private currentIndex: number;

    private mouseDown: boolean;

    constructor(parent: HTMLElement) {
        super();

        this.element = createElement("div", "slider");
        this.element.style.aspectRatio = `${TPS_VALUES.length}`;
        this.thumb = createElement("div", "slider-thumb");
        this.thumb.addEventListener("mousedown", this.onMouseDown);
        document.addEventListener("mouseup", this.onMouseUp);
        document.addEventListener("mousemove", this.onMouseMove);
        this.element.appendChild(this.thumb);
        parent.appendChild(this.element);

        this.select(0);
    }

    destroy() {
        this.element.remove();
        document.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("mousemove", this.onMouseMove);
    }

    get value() {
        return TPS_VALUES[this.currentIndex];
    }

    private select(index: number) {
        this.currentIndex = index;
        this.dispatchEvent(new CustomEvent("select", { detail: { value: this.value } }));
        this.thumb.style.left = `${index * 4}vh`;
        this.thumb.innerText = `${this.value}`;
    }

    private readonly onMouseDown = () => {
        this.mouseDown = true;
    };

    private readonly onMouseUp = () => {
        this.mouseDown = false;
    };

    private readonly onMouseMove = (event: MouseEvent) => {
        if (!this.mouseDown)
            return;
        const rect = this.element.getBoundingClientRect();
        let index = ~~((event.clientX - rect.left) / (document.body.clientHeight * 0.04));
        if (index < 0)
            index = 0;
        else if (index > TPS_VALUES.length - 1)
            index = TPS_VALUES.length - 1;
        this.select(index);
    };
}