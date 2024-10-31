export class LogicNode {
    readonly type: number;
    readonly signals: boolean[];
    readonly targets: LogicNode[] = [];
    signalCount: number = 0;

    constructor(type: number, size: number) {
        this.type = type;
        this.signals = new Array(size).fill(false);
    }
}