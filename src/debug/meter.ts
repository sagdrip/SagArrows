export const UPDATE_FREQUENCY = 500;

export class Meter {
    private startTime: number = performance.now();
    private steps: number = 0;

    value: number = 0;

    step() {
        ++this.steps;
    }

    update() {
        const now = performance.now();
        const elapsedTime = now - this.startTime;
        if (elapsedTime >= UPDATE_FREQUENCY) {
            this.value = this.steps * 1000 / elapsedTime;
            this.startTime = now;
            this.steps = 0;
        }
    }
}