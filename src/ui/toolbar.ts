import { createElement } from "../dom";
import { Icon } from "./icon";
import arrowAtlas from "../../res/atlas.png";
import medalAtlas from "../../res/medals.png";
import { ATLAS_TILE_SIZE } from "../rendering/render";

export const ARROWS = [
    [1, 2, 3, 4, 5],
    [6, 7],
    [8, 9, 10, 11],
    [12, 13]
];

export const MEDALS = [
    [1, 2, 3, 4],
    [5, 6]
];

export const PAGE_SIZE = 5;

export class Toolbar extends EventTarget {
    private readonly element: HTMLDivElement;
    private readonly sectionButtonsContainer: HTMLDivElement;

    private readonly sectionButtons: HTMLSpanElement[] = [];
    private readonly pages: HTMLDivElement[][] = [];
    private readonly pageItems: number[][][] = [];
    private readonly items: HTMLDivElement[][] = [];

    private sectionId: number = -1;

    private selectedItem: readonly [number, number] = [-1, -1];

    private currentSection: number = 0;
    private currentPage: number = 0;

    constructor(parent: HTMLElement) {
        super();

        this.element = createElement("div", "toolbar");
        this.sectionButtonsContainer = createElement("div", "toolbar-section-buttons");
        this.element.append(this.sectionButtonsContainer);
        const leftArrow = createElement("div", "toolbar-arrow toolbar-arrow-left");
        leftArrow.onclick = () => this.prevPage();
        this.element.append(leftArrow);
        const pagesContainer = createElement("div", "toolbar-pages");
        this.element.append(pagesContainer);
        const rightArrow = createElement("div", "toolbar-arrow toolbar-arrow-right");
        rightArrow.onclick = () => this.nextPage();
        this.element.append(rightArrow);
        parent.append(this.element);

        const arrowPages = [];
        const arrowItems = [];
        let arrowId = 0;
        for (const arrows of ARROWS) {
            const page = createElement("div", "toolbar-page");
            page.style.display = "none";
            for (let i = 0; i < PAGE_SIZE; ++i) {
                const item = createElement("div", "toolbar-item");
                if (arrows[i]) {
                    const arrowType = arrows[i] - 1;
                    const currentArrowId = arrowId;
                    const icon = new Icon(item, arrowAtlas, arrowType, ATLAS_TILE_SIZE, ATLAS_TILE_SIZE);
                    icon.addEventListener("click", () => {
                        this.selectItem(0, currentArrowId);
                    });
                    arrowItems.push(item);
                    ++arrowId;
                } else {
                    item.classList.add("toolbar-item-empty");
                }
                page.append(item);
            }
            pagesContainer.append(page);
            arrowPages.push(page);
        }
        this.addSection("arrows", arrowPages, arrowItems, ARROWS);

        const medalPages = [];
        const medalItems = [];
        let medalId = 0;
        for (const medals of MEDALS) {
            const page = createElement("div", "toolbar-page");
            page.style.display = "none";
            for (let i = 0; i < PAGE_SIZE; ++i) {
                const item = createElement("div", "toolbar-item");
                if (medals[i]) {
                    const medalType = medals[i] - 1;
                    const icon = new Icon(item, medalAtlas, medalType, ATLAS_TILE_SIZE, ATLAS_TILE_SIZE);
                    const currentMedalId = medalId;
                    icon.addEventListener("click", () => {
                        this.selectItem(1, currentMedalId);
                    });
                    medalItems.push(item);
                    ++medalId;
                } else {
                    item.classList.add("toolbar-item-empty");
                }
                page.append(item);
            }
            pagesContainer.append(page);
            medalPages.push(page);
        }
        this.addSection("medals", medalPages, medalItems, MEDALS);

        this.selectSection(0);
        this.goToPage(0);
    }

    destroy() {
        this.element.remove();
    }

    private addSection(name: string, pages: HTMLDivElement[], items: HTMLDivElement[], pageItems: number[][]) {
        const id = ++this.sectionId;
        const sectionButton = createElement("span", `${name}-section-button toolbar-section-button`);
        sectionButton.onclick = () => this.selectSection(id);
        this.sectionButtonsContainer.append(sectionButton);
        this.sectionButtons.push(sectionButton);
        this.pages.push(pages);
        this.items.push(items);
        this.pageItems.push(pageItems);
    }

    selectSection(section: number) {
        this.sectionButtons[this.currentSection].classList.remove("toolbar-section-button-active");
        this.sectionButtons[section].classList.add("toolbar-section-button-active");
        this.pages[this.currentSection][this.currentPage].style.display = "none";
        this.pages[section][0].style.display = null;
        this.currentSection = section;
        this.currentPage = 0;
    }

    goToPage(page: number) {
        this.pages[this.currentSection][this.currentPage].style.display = "none";
        this.pages[this.currentSection][page].style.display = null;
        this.currentPage = page;
    }

    nextSection() {
        let section = this.currentSection + 1;
        if (section >= this.pages.length)
            section = 0;
        this.selectSection(section);
    }

    prevPage() {
        let page = this.currentPage - 1;
        if (page < 0)
            page = this.pages[this.currentSection].length - 1;
        this.goToPage(page);
    }

    nextPage() {
        let page = this.currentPage + 1;
        if (page >= this.pages[this.currentSection].length)
            page = 0;
        this.goToPage(page);
    }

    selectItem(section: number, item: number) {
        if (this.selectedItem[0] === section && this.selectedItem[1] === item && section !== -1 && item !== -1) {
            this.selectItem(-1, -1);
            return;
        }
        this.items[this.selectedItem[0]]?.[this.selectedItem[1]].classList.remove("toolbar-item-active");
        this.items[section]?.[item].classList.add("toolbar-item-active");
        this.selectedItem = [section, item];
        this.dispatchEvent(new CustomEvent("select", { detail: { section, item } }));
    }

    selectItemOnCurrentPage(item: number) {
        const itemId = this.pageItems[this.currentSection][this.currentPage][item - 1];
        if (itemId)
            this.selectItem(this.currentSection, itemId - 1);
    }

    clearSelection() {
        this.selectItem(-1, -1);
    }
}