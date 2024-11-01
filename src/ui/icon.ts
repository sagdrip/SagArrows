import { createElement } from "../dom";

export class Icon extends EventTarget {
    private readonly element: HTMLSpanElement;

    constructor(parent: HTMLElement, texture: string, tileIndex: number, tileWidth: number, tileHeight: number) {
        super();

        const img = new Image();
        img.src = texture;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = tileWidth;
            canvas.height = tileHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, (tileIndex % 16) * tileWidth, ~~(tileIndex / 16) * tileHeight, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
            this.element.style.backgroundImage = `url(${canvas.toDataURL()})`;
            img.remove();
            canvas.remove();
        };

        this.element = createElement("span", "icon");
        this.element.addEventListener("click", () => this.dispatchEvent(new MouseEvent("click")));
        parent.appendChild(this.element);
    }

    destroy() {
        this.element.remove();
    }
}