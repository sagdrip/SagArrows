export const REFRESH_TIME = 10;

export class Ticker {
    private tasks: Map<number, (() => void)[]> = new Map();
    private running: boolean = false;
    private interval: number;
    paused: boolean = false;
    tick: number = 0;

    private lastUpdate: number;

    private updateTime: number;
    private updates: number;

    private idleTime: number;

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
        const startTime = performance.now();
        this.tickCallback?.();
        this.updateTime += performance.now() - startTime;
        const tasks = this.tasks.get(this.tick);
        if (tasks)
            for (const task of tasks)
                task();
        ++this.tick;
        ++this.updates;
    }

    private updateFrame() {
        const averageFPS = 1000 / (performance.now() - this.lastUpdate);
        this.lastUpdate = performance.now();
        this.idleTime = 0;
        {
            const startTime = performance.now();
            this.frameCallback?.();
            this.idleTime += performance.now() - startTime;
        }
        if (!this.paused) {
            let now: number;
            while ((now = performance.now()) >= this.nextUpdate) {
                this.updateTick();
                this.nextUpdate += Math.max(this.interval, this.updateTime / this.updates + (averageFPS * (this.idleTime + REFRESH_TIME)) / (1000 * this.updates / this.updateTime));
            }
        }
        {
            const startTime = performance.now();
            this.afterFrameCallback?.();
            this.idleTime += performance.now() - startTime;
        }
    }

    private update() {
        this.updateFrame();
        if (this.running)
            requestAnimationFrame(() => this.update());
    }

    private reset() {
        const now = performance.now();
        this.lastUpdate = now;
        this.nextUpdate = now;
        this.updateTime = 0;
        this.updates = 0;
        this.idleTime = 0;
    }

    start() {
        this.running = true;
        this.reset();
        this.update();
    }

    step() {
        this.updateTick();
    }

    setPaused(paused: boolean) {
        this.paused = paused;
        this.reset();
    }

    stop() {
        this.running = false;
    }

    setTickRate(rate: number) {
        this.interval = 1000 / rate;
        this.reset();
    }

    schedule(task: () => void, delay: number) {
        delay += this.tick;
        let tasks = this.tasks.get(delay);
        if (!tasks) this.tasks.set(delay, [task]);
        else tasks.push(task);
    }
}