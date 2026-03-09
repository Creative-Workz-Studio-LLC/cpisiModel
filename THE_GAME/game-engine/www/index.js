import { GameOfLife } from "../pkg/game_engine";
import { memory } from "../pkg/game_engine_bg";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#111";
const DEAD_COLOR = "#000";
const ALIVE_COLOR = "#0f0";
const STILL_COLOR = "#003300";

// Construct the Game
const width = 128;
const height = 128;
const game = GameOfLife.new(width, height);

const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

const renderLoop = () => {
    game.tick();
    drawGrid();
    drawCells();
    requestAnimationFrame(renderLoop);
};

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
};

const drawCells = () => {
    const cellsPtr = game.get_grid();
    const cells = new Int8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = row * width + col;
            
            // Map Ternary to Color
            // 1  -> Alive (Neon Green)
            // 0  -> Still (Dark Green)
            // -1 -> Dead (Black)
            ctx.fillStyle = cells[idx] === 1 ? ALIVE_COLOR : (cells[idx] === 0 ? STILL_COLOR : DEAD_COLOR);

            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke();
};

renderLoop();
