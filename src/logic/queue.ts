export class Queue<T> {
    private readonly array: T[];
    private readonly size: number;
    private offset: number = 0;

    constructor(size: number, fill: T) {
        this.array = new Array(size).fill(fill);
        this.size = size;
    }

    insert(value: T) {
        this.offset += this.size - 1;
        this.array[this.offset] = value;
    }

    at(index: number) {
        if (index < 0)
            index += this.size;
        return this.array[(this.offset + index) % this.size];
    }

    set(index: number, value: T) {
        if (index < 0)
            index += this.size;
        this.array[(this.offset + index) % this.size] = value;
    }
}