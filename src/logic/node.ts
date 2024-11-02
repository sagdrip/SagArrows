import { Arrow } from "./arrow";
import { Queue } from "./queue";

export class LogicNode {
    readonly arrows: Arrow[];
    readonly type: number;
    readonly targets: LogicNode[] = [];
    size: number;
    signals: Queue<boolean>;
    signalCount: number = 0;
    lastSignal: boolean = false;
    lastSignalCount: number = 0;

    constructor(arrows: Arrow[], type: number, size: number) {
        this.arrows = arrows;
        this.type = type;
        this.size = size;
        this.signals = new Queue(size, false);
    }

    resize(size: number) {
        this.size = size;
        this.signals = new Queue(size, false);
    }

    copy() {
        return new LogicNode([...this.arrows], this.type, this.size);
    }
}