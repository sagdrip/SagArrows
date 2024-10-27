import { Arrow } from "./arrow";
import { CHUNK_SIZE } from "./chunk";
import { GameMap } from "./game-map";
import { hash2chunkPos, hash2pos, pos2hash } from "./pos2hash";

export class PlayerSelection {
    arrows?: Map<bigint, Arrow>;
    rotatedArrows?: Map<bigint, Arrow>;
    medal?: number;

    rotation: number;
    flipped: boolean;

    selectArrows(map: GameMap) {
        this.arrows = new Map();
        this.medal = undefined;
        map.chunks.forEach((chunk, position) => {
            const [chunkX, chunkY] = hash2chunkPos(position);
            for (let y = 0; y < CHUNK_SIZE; ++y)
                for (let x = 0; x < CHUNK_SIZE; ++x) {
                    const arrow = chunk.getArrow(x, y);
                    if (arrow.arrowType > 0) {
                        this.arrows.set(pos2hash(chunkX * CHUNK_SIZE + x, chunkY * CHUNK_SIZE + y), arrow.copy());
                    }
                }
        });
        this.setRotationState(0, false);
    }

    selectArrow(arrow: Arrow) {
        const copy = arrow.copy();
        copy.rotation = 0;
        copy.flipped = false;
        this.arrows = new Map([[0n, copy]]);
        this.medal = undefined;
        this.setRotationState(arrow.rotation, arrow.flipped);
    }

    selectMedal(type: number) {
        this.arrows = undefined;
        this.medal = type;
    }

    clear() {
        this.arrows = undefined;
        this.medal = undefined;
    }

    setRotationState(rotation: number, flipped: boolean) {
        this.rotation = rotation;
        this.flipped = flipped;
        this.update();
    }

    setRotation(rotation: number) {
        this.rotation = rotation;
        this.update();
    }

    setFlipped(flipped: boolean) {
        this.flipped = flipped;
        this.update();
    }

    flip() {
        this.setFlipped(!this.flipped);
    }

    private update() {
        this.rotatedArrows = new Map();
        this.arrows.forEach((originalArrow, position) => {
            let [x, y] = hash2pos(position);
            const arrow = originalArrow.copy();
            if (this.flipped) {
                arrow.flipped = !arrow.flipped;
                if (arrow.rotation === 1 || arrow.rotation === 3)
                    arrow.rotation = (originalArrow.rotation + 2) % 4;
                x = -x;
            }
            let rotatedX = x;
            let rotatedY = y;
            if (this.rotation === 1) {
                rotatedX = -y;
                rotatedY = x;
                arrow.rotation = (arrow.rotation + 1) % 4;
            } else if (this.rotation === 2) {
                rotatedX = -x;
                rotatedY = -y;
                arrow.rotation = (arrow.rotation + 2) % 4;
            } else if (this.rotation === 3) {
                rotatedX = y;
                rotatedY = -x;
                arrow.rotation = (arrow.rotation + 3) % 4;
            }
            this.rotatedArrows.set(pos2hash(rotatedX, rotatedY), arrow);
        });
    }
}