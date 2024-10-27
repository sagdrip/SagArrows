import { Chunk, CHUNK_SIZE } from "./chunk";
import { GameMap } from "./game-map";
import { chunkPos2hash } from "./pos2hash";

export const MAGIC = "SAGA".split("").map((c) => c.charCodeAt(0));

export function save(map: GameMap) {
    const buffer: number[] = [];
    buffer.push(...MAGIC);
    map.chunks.forEach((chunk, position) => {
        buffer.push(Number(position & 0xFFn), Number((position >> 8n) & 0xFFn));
        buffer.push(Number((position >> 16n) & 0xFFn), Number((position >> 24n) & 0xFFn));
        const arrowTypes = new Map<number, [number, number][]>();
        for (let y = 0; y < CHUNK_SIZE; ++y) {
            for (let x = 0; x < CHUNK_SIZE; ++x) {
                const type: number = chunk.getArrow(x, y).arrowType;
                if (type > 0)
                    arrowTypes.set(type, [...(arrowTypes.get(type) ?? []), [x, y]]);
            }
        }
        buffer.push(arrowTypes.size - 1);
        arrowTypes.forEach((positions, type) => {
            buffer.push(type - 1);
            buffer.push(positions.length - 1);
            for (const [x, y] of positions) {
                const arrow = chunk.getArrow(x, y);
                buffer.push(y * CHUNK_SIZE + x);
                buffer.push(arrow.medalType);
                buffer.push(arrow.rotation | (+arrow.flipped * 0x04));
            }
        });
    });
    return btoa(String.fromCharCode(...buffer));
}

export function load(map: GameMap, save: string) {
    const buffer = atob(save).split("").map((c) => c.charCodeAt(0));
    let offset = -1;
    for (const code of MAGIC)
        if (buffer[++offset] != code)
            throw new Error("Invalid magic");
    const bufSize = buffer.length - 1;
    while (offset < bufSize) {
        let chunkY = Number(buffer[++offset] | (buffer[++offset] << 8));
        if (chunkY & 0x8000)
            chunkY = -(chunkY ^ 0xFFFF) - 1;
        let chunkX = Number(buffer[++offset] | (buffer[++offset] << 8));
        if (chunkX & 0x8000)
            chunkX = -(chunkX ^ 0xFFFF) - 1;
        const chunk = new Chunk(chunkPos2hash(chunkX, chunkY));
        const typeCount = buffer[++offset] + 1;
        for (let i = 0; i < typeCount; ++i) {
            const type = buffer[++offset] + 1;
            const arrowCount = buffer[++offset] + 1;
            for (let j = 0; j < arrowCount; ++j) {
                const arrowX = buffer[++offset] % CHUNK_SIZE;
                const arrowY = ~~(buffer[offset] / CHUNK_SIZE);
                const arrow = chunk.getArrow(arrowX, arrowY);
                arrow.arrowType = type;
                arrow.medalType = buffer[++offset];
                arrow.rotation = buffer[++offset] & 0x03;
                arrow.flipped = !!(buffer[offset] & 0x04);
            }
        }
        map.addChunk(chunkX, chunkY, chunk);
    }
}