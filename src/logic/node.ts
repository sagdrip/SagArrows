export class LogicNode {
    readonly type: number;
    readonly targets: LogicNode[] = [];
    signals: boolean[];
    signalCount: number = 0;
    lastSignal: boolean = false;
    lastSignalCount: number = 0;

    constructor(type: number, size: number) {
        this.type = type;
        this.signals = new Array(size).fill(false);
    }
}