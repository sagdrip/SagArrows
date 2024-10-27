import { createElement } from "../dom";

export class Icon extends EventTarget {
    private readonly element: HTMLDivElement;

    constructor(parent: HTMLElement, texture: string, tileIndex: number, tileWidth: number, tileHeight: number) {
        super();

        this.element = createElement("div", "icon-container");
        const image = createElement("img", "icon");
        image.src = texture;
        image.draggable = false;
        image.onload = () => {
            image.style.width = `${image.naturalWidth * 100 / tileWidth}%`;
            image.style.height = `${image.naturalHeight * 100 / tileHeight}%`;
            const xOffset = (tileIndex % (image.naturalWidth / tileWidth)) * 100 / image.naturalWidth * tileWidth;
            const yOffset = ~~(tileIndex / (image.naturalHeight / tileHeight)) * 100 / image.naturalHeight * tileHeight;
            image.style.transform = `translate(-${xOffset}%, -${yOffset}%)`;
        };
        image.addEventListener("click", () => this.dispatchEvent(new MouseEvent("click")));
        this.element.append(image);
        parent.appendChild(this.element);
    }

    destroy() {
        this.element.remove();
    }
}