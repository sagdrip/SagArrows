import { Chunk, CHUNK_SIZE } from "./chunk";
import { chunkPos2hash } from "./pos2hash";

export class GameMap {
    chunks: Map<bigint, Chunk> = new Map();

    private deleteChunk(chunk: Chunk) {
        this.chunks.delete(chunk.hash);
        chunk.adjacentChunks.forEach((adjacentChunk, index) => {
            if (adjacentChunk)
                adjacentChunk.adjacentChunks[(index + 4) % 8] = undefined;
        });
    }

    addChunk(x: number, y: number, chunk: Chunk) {
        this.chunks.set(chunkPos2hash(x, y), chunk);
        const neighbours = [
            this.getChunk(x,     y - 1),
            this.getChunk(x + 1, y - 1),
            this.getChunk(x + 1, y),
            this.getChunk(x + 1, y + 1),
            this.getChunk(x,     y + 1),
            this.getChunk(x - 1, y + 1),
            this.getChunk(x - 1, y),
            this.getChunk(x - 1, y - 1)
        ];
        for (let i = 0; i < 8; ++i) {
            const adjacentChunk = neighbours[i];
            if (adjacentChunk) {
                chunk.adjacentChunks[i] = adjacentChunk;
                adjacentChunk.adjacentChunks[(i + 4) % 8] = chunk;
            }
        }
    }

    getChunk(x: number, y: number) {
        return this.chunks.get(chunkPos2hash(x, y));
    }

    getOrCreateChunk(x: number, y: number) {
        const existingChunk = this.getChunk(x, y);
        if (existingChunk)
            return existingChunk;
        const chunk = new Chunk(chunkPos2hash(x, y));
        this.addChunk(x, y, chunk);
        return chunk;
    }

    getChunkForArrow(x: number, y: number) {
        const nX = +(x < 0);
        const nY = +(y < 0);
        const chunkX = ~~((x + nX) / 16) - nX;
        const chunkY = ~~((y + nY) / 16) - nY;
        return this.getChunk(chunkX, chunkY);
    }

    getArrow(x: number, y: number) {
        const nX = +(x < 0);
        const nY = +(y < 0);
        const chunkX = ~~((x + nX) / 16) - nX;
        const chunkY = ~~((y + nY) / 16) - nY;
        x -= chunkX * CHUNK_SIZE;
        y -= chunkY * CHUNK_SIZE;
        return this.getChunk(chunkX, chunkY)?.getArrow(x, y);
    }

    getOrCreateArrow(x: number, y: number) {
        const nX = +(x < 0);
        const nY = +(y < 0);
        const chunkX = ~~((x + nX) / 16) - nX;
        const chunkY = ~~((y + nY) / 16) - nY;
        x -= chunkX * CHUNK_SIZE;
        y -= chunkY * CHUNK_SIZE;
        return this.getOrCreateChunk(chunkX, chunkY).getArrow(x, y);
    }

    removeArrow(x: number, y: number) {
        const arrow = this.getArrow(x, y);
        arrow.arrowType = 0;
        arrow.rotation = 0;
        arrow.flipped = false;
        arrow.signalCount = 0;
        arrow.active = false;
        arrow.lastState = arrow.copyState();
        const chunk = this.getChunkForArrow(x, y);
        if (chunk.isEmpty())
            this.deleteChunk(chunk);
    }
}