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

    getArrowRelative(x: number, y: number) {
        let targetChunk: Chunk = this;
        if (x >= CHUNK_SIZE) {
            if (y >= CHUNK_SIZE) {
                targetChunk = this.adjacentChunks[3];
                x -= CHUNK_SIZE;
                y -= CHUNK_SIZE;
            } else if (y < 0) {
                targetChunk = this.adjacentChunks[1];
                x -= CHUNK_SIZE;
                y += CHUNK_SIZE;
            } else {
                targetChunk = this.adjacentChunks[2];
                x -= CHUNK_SIZE;
            }
        } else if (x < 0) {
            if (y < 0) {
                targetChunk = this.adjacentChunks[7];
                x += CHUNK_SIZE;
                y += CHUNK_SIZE;
            } else if (y >= CHUNK_SIZE) {
                targetChunk = this.adjacentChunks[5];
                x += CHUNK_SIZE;
                y -= CHUNK_SIZE;
            } else {
                targetChunk = this.adjacentChunks[6];
                x += CHUNK_SIZE;
            }
        } else if (y < 0) {
            targetChunk = this.adjacentChunks[0];
            y += CHUNK_SIZE;
        } else if (y >= CHUNK_SIZE) {
            targetChunk = this.adjacentChunks[4];
            y -= CHUNK_SIZE;
        }
        return targetChunk?.getArrow(x, y);
    }

    isEmpty() {
        return this.arrows.every((arrow) => arrow.arrowType === 0);
    }
}