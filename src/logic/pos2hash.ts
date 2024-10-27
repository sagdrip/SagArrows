export function chunkPos2hash(x: number, y: number): bigint {
    return ((BigInt(x) & 0xFFFFn) << 16n) + (BigInt(y) & 0xFFFFn);
}

export function hash2chunkPos(hash: bigint): [number, number] {
    let x = Number(hash >> 16n);
    if (x & 0x8000)
        x = -(x ^ 0xFFFF) - 1;
    let y = Number(hash & 0xFFFFn);
    if (y & 0x8000)
        y = -(y ^ 0xFFFF) - 1;
    return [x, y];
}

export function pos2hash(x: number, y: number): bigint {
    return ((BigInt(x) & 0xFFFFFn) << 20n) + (BigInt(y) & 0xFFFFFn);
}

export function hash2pos(hash: bigint): [number, number] {
    let x = Number(hash >> 20n);
    if (x & 0x80000)
        x = -(x ^ 0xFFFFF) - 1;
    let y = Number(hash & 0xFFFFFn);
    if (y & 0x80000)
        y = -(y ^ 0xFFFFF) - 1;
    return [x, y];
}