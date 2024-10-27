import { Arrow } from "./arrow";
import { Chunk, CHUNK_SIZE } from "./chunk";

export function sendSignal(chunk: Chunk, arrow: Arrow, x: number, y: number, dx: number, dy: number) {
    if (arrow.flipped)
        dx = -dx;
    if (arrow.rotation === 0) {
        y += dy;
        x += dx;
    } else if (arrow.rotation === 1) {
        x += dy;
        y -= dx;
    } else if (arrow.rotation === 2) {
        y -= dy;
        x -= dx;
    } else if (arrow.rotation === 3) {
        x -= dy;
        y += dx;
    }
    let targetChunk = chunk;
    if (x >= CHUNK_SIZE) {
        if (y >= CHUNK_SIZE) {
            targetChunk = chunk.adjacentChunks[3];
            x -= CHUNK_SIZE;
            y -= CHUNK_SIZE;
        } else if (y < 0) {
            targetChunk = chunk.adjacentChunks[1];
            x -= CHUNK_SIZE;
            y += CHUNK_SIZE;
        } else {
            targetChunk = chunk.adjacentChunks[2];
            x -= CHUNK_SIZE;
        }
    } else if (x < 0) {
        if (y < 0) {
            targetChunk = chunk.adjacentChunks[7];
            x += CHUNK_SIZE;
            y += CHUNK_SIZE;
        } else if (y >= CHUNK_SIZE) {
            targetChunk = chunk.adjacentChunks[5];
            x += CHUNK_SIZE;
            y -= CHUNK_SIZE;
        } else {
            targetChunk = chunk.adjacentChunks[6];
            x += CHUNK_SIZE;
        }
    } else if (y < 0) {
        targetChunk = chunk.adjacentChunks[0];
        y += CHUNK_SIZE;
    } else if (y >= CHUNK_SIZE) {
        targetChunk = chunk.adjacentChunks[4];
        y -= CHUNK_SIZE;
    }
    if (!targetChunk)
        return;
    const targetArrow = targetChunk.getArrow(x, y);
    if (targetArrow.arrowType > 0)
        ++targetArrow.signalCount;
}