import { Arrow } from "./arrow";

export const CHUNK_SIZE = 16;

export class Chunk {
    readonly hash: bigint;
    readonly adjacentChunks: Chunk[];
    readonly arrows: Arrow[];

    constructor(hash: bigint) {
        this.hash = hash;
        this.adjacentChunks = new Array(8);
        this.arrows = [];
        for (let y = 0; y < CHUNK_SIZE; ++y)
            for (let x = 0; x < CHUNK_SIZE; ++x) {
                this.arrows.push(new Arrow());
            }
    }

    getArrow(x: number, y: number) {
        return this.arrows[y * CHUNK_SIZE + x];
    }

    isEmpty() {
        return this.arrows.every((arrow) => arrow.arrowType === 0);
    }
}