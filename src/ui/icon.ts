import { createElement } from "../util/dom";

export class Icon extends EventTarget {
    private readonly element: HTMLSpanElement;

    constructor(parent: HTMLElement, url: string) {
        super();

        this.element = createElement("span", "icon");
        this.element.style.backgroundImage = `url(${url})`;
        this.element.addEventListener("click", () => this.dispatchEvent(new MouseEvent("click")));
        parent.appendChild(this.element);
    }

    destroy() {
        this.element.remove();
    }
}