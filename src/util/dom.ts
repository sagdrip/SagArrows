export function createElement<T extends keyof HTMLElementTagNameMap>(tag: T, className: string, ...children: HTMLElement[]): HTMLElementTagNameMap[T] {
    const element = document.createElement(tag);
    element.className = className;
    element.append(...children);
    return element;
}