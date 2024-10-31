import { LogicNode } from "./node";

export class Arrow {
    arrowType: number = 0;
    medalType: number = 0;
    rotation: number = 0;
    flipped: boolean = false;
    signalCount: number = 0;
    active: boolean = false;

    lastState: Arrow = this;

    node: LogicNode;
    offset: number;
    originalNode: LogicNode;

    constructor(arrowType: number = 0, medalType: number = 0, rotation: number = 0, flipped: boolean = false) {
        this.arrowType = arrowType;
        this.medalType = medalType;
        this.rotation = rotation;
        this.flipped = flipped;
    }

    copy() {
        return new Arrow(this.arrowType, this.medalType, this.rotation, this.flipped);
    }

    copyState() {
        const copy = this.copy();
        copy.signalCount = this.signalCount;
        copy.active = this.active;
        return copy;
    }

    merge(source: Arrow) {
        if (source.arrowType === 0)
            throw new Error("Merging with empty arrow");
        this.arrowType = source.arrowType;
        this.medalType = source.medalType;
        this.rotation = source.rotation;
        this.flipped = source.flipped;
    }
}