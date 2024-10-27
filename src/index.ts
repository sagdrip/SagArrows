import { Game } from "./game";

const canvas = document.querySelector<HTMLCanvasElement>("#game");

const game = new Game(document.body, canvas.getContext("webgl", { premultipliedAlpha: false }));
game.start();