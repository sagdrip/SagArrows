export class Ticker {
    private tasks: Map<number, (() => void)[]> = new Map();
    private running: boolean = false;
    private interval: number;
    paused: boolean = false;
    tick: number = 0;

    private nextUpdate: number;

    private readonly tickCallback?: () => void;
    private readonly frameCallback?: () => void;
    private readonly afterFrameCallback?: () => void;

    constructor(tickRate: number, tickCallback?: () => void, frameCallback?: () => void, afterFrameCallback?: () => void) {
        this.tickCallback = tickCallback;
        this.frameCallback = frameCallback;
        this.afterFrameCallback = afterFrameCallback;
        this.setTickRate(tickRate);
    }

    private updateTick() {
        this.tickCallback?.();
        const tasks = this.tasks.get(this.tick);
        if (tasks)
            for (const task of tasks)
                task();
        ++this.tick;
    }

    private updateFrame() {
        this.frameCallback?.();
        if (!this.paused) {
            let now: number;
            while ((now = performance.now()) >= this.nextUpdate) {
                this.updateTick();
                this.nextUpdate += this.interval;
            }
        }
        this.afterFrameCallback?.();
    }

    private update() {
        this.updateFrame();
        if (this.running)
            requestAnimationFrame(() => this.update());
    }

    start() {
        this.running = true;
        this.nextUpdate = performance.now();
        this.update();
    }

    step() {
        this.updateTick();
    }

    setPaused(paused: boolean) {
        this.paused = paused;
        this.nextUpdate = performance.now();
    }

    stop() {
        this.running = false;
    }

    setTickRate(rate: number) {
        this.interval = 1000 / rate;
        this.nextUpdate = Math.min(this.nextUpdate, performance.now() + this.interval);
    }

    schedule(task: () => void, delay: number) {
        delay += this.tick;
        let tasks = this.tasks.get(delay);
        if (!tasks) this.tasks.set(delay, [task]);
        else tasks.push(task);
    }
}