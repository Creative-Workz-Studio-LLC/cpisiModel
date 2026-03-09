// #!omni:code --rust
// ╠═==================================================================================================================═╣
//
// ╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
// ║ [BLOCK:ROOT] THE BODY: THE GAME OF LIFE ENGINE (FULL REALIZATION)                                                  ║
// ╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣

use wasm_bindgen::prelude::*;
use web_sys::console;

// [FILE:IDENTITY] game-engine-core
// [LOG: IDENTITY] The Dawndusk Handshake - Full Implementation

#[wasm_bindgen]
pub struct GameOfLife {
    grid: Vec<i8>, // Ternary Grid: -1 (Shavar), 0 (Yashar), 1 (Tov)
    width: u32,
    height: u32,
}

#[wasm_bindgen]
impl GameOfLife {
    // ║                                                                                     ║                              ║
    // ║ ╔═════════════════════════════════════════════════════════════════════════════════╗ ║                              ║
    // ║ ║ [BLOCK:SETUP] Initialization                                                    ║ ║                              ║
    // ║ ╠═════════════════════════════════════════════════════════════════════════════════╣ ║                              ║
    // ║ ║                                                                                 ║ ║                              ║
                                                                                        // ║ ║ [SUB: THE ANCHOR]        ║
    pub fn new(width: u32, height: u32) -> GameOfLife {                                 // ║ ║                              ║
        console::log_1(&"--- INITIALIZING THE GAME: 0.0 YASHAR ---".into());            // ║ ║                              ║
        let mut grid = vec![0; (width * height) as usize];                              // ║ ║                              ║
                                                                                        // ║ ║                              ║
        // Seed the initial state with a "Cross of Life"                                // ║ ║                              ║
        let mid_x = width / 2;                                                          // ║ ║                              ║
        let mid_y = height / 2;                                                         // ║ ║                              ║
        grid[(mid_y * width + mid_x) as usize] = 1;                                     // ║ ║                              ║
        grid[((mid_y-1) * width + mid_x) as usize] = 1;                                 // ║ ║                              ║
        grid[((mid_y+1) * width + mid_x) as usize] = 1;                                 // ║ ║                              ║
        grid[(mid_y * width + (mid_x-1)) as usize] = 1;                                 // ║ ║                              ║
        grid[(mid_y * width + (mid_x+1)) as usize] = 1;                                 // ║ ║                              ║
                                                                                        // ║ ║                              ║
        GameOfLife { grid, width, height }                                              // ║ ║                              ║
    }                                                                                   // ║ ║                              ║
                                                                                        // ║ ║                              ║
    pub fn get_grid(&self) -> *const i8 {                                               // ║ ║ [SUB: DATA BRIDGE]      ║
        self.grid.as_ptr()                                                              // ║ ║                              ║
    }                                                                                   // ║ ║                              ║
                                                                                        // ║ ║                              ║
    // ║ ╚═════════════════════════════════════════════════════════════════════════════════╝ ║                              ║
    // ║                                                                                     ║                              ║
    // ╠═════════════════════════════════════════════════════════════════════════════════════╬══════════════════════════════╣
    // ║                                                                                     ║                              ║
    // ║ ╔═════════════════════════════════════════════════════════════════════════════════╗ ║                              ║
    // ║ ║ [BLOCK:BODY] The Hinge Cycle (The Ticks)                                        ║ ║                              ║
    // ╠═╬═════════════════════════════════════════════════════════════════════════════════╬═╣                              ║
    // ║ ║                                                                                 ║ ║                              ║
                                                                                        // ║ ║ [SUB: THE NEIGHBORS]      ║
    fn get_index(&self, row: u32, col: u32) -> usize {                                  // ║ ║                              ║
        (row * self.width + col) as usize                                               // ║ ║                              ║
    }                                                                                   // ║ ║                              ║
                                                                                        // ║ ║                              ║
    fn live_neighbor_count(&self, row: u32, col: u32) -> u8 {                           // ║ ║                              ║
        let mut count = 0;                                                              // ║ ║                              ║
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {                      // ║ ║                              ║
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {                   // ║ ║                              ║
                if delta_row == 0 && delta_col == 0 { continue; }                       // ║ ║                              ║
                let neighbor_row = (row + delta_row) % self.height;                     // ║ ║                              ║
                let neighbor_col = (col + delta_col) % self.width;                      // ║ ║                              ║
                let idx = self.get_index(neighbor_row, neighbor_col);                   // ║ ║                              ║
                if self.grid[idx] == 1 { count += 1; }                                  // ║ ║                              ║
            }                                                                           // ║ ║                              ║
        }                                                                               // ║ ║                              ║
        count                                                                           // ║ ║                              ║
    }                                                                                   // ║ ║                              ║
                                                                                        // ║ ║                              ║
                                                                                        // ║ ║ [SUB: THE HINGE ACT]      ║
    pub fn tick(&mut self) {                                                            // ║ ║                              ║
        let mut next_grid = self.grid.clone();                                          // ║ ║                              ║
                                                                                        // ║ ║                              ║
        for row in 0..self.height {                                                     // ║ ║                              ║
            for col in 0..self.width {                                                  // ║ ║                              ║
                let idx = self.get_index(row, col);                                     // ║ ║                              ║
                let cell = self.grid[idx];                                              // ║ ║                              ║
                let live_neighbors = self.live_neighbor_count(row, col);                // ║ ║                              ║
                                                                                        // ║ ║                              ║
                let next_state = match (cell, live_neighbors) {                         // ║ ║ [TRANSITION]              ║
                    (1, 2) | (1, 3) => 1,  // Survival (Tov)                            // ║ ║                              ║
                    (0 | -1, 3)     => 1,  // Birth (Tov)                               // ║ ║                              ║
                    _               => -1, // Death/Void (Shavar)                       // ║ ║                              ║
                };                                                                      // ║ ║                              ║
                                                                                        // ║ ║                              ║
                next_grid[idx] = next_state;                                            // ║ ║                              ║
            }                                                                           // ║ ║                              ║
        }                                                                               // ║ ║                              ║
                                                                                        // ║ ║                              ║
        self.grid = next_grid;                                                          // ║ ║                              ║
    }                                                                                   // ║ ║                              ║
                                                                                        // ║ ║                              ║
    // ║ ╚═════════════════════════════════════════════════════════════════════════════════╝ ║                              ║
    // ║                                                                                     ║                              ║
    // ╠═════════════════════════════════════════════════════════════════════════════════════╬══════════════════════════════╣
    // ║                                                                                     ║                              ║
    // ╔═════════════════════════════════════════════════════════════════════════════════╗ ║                              ║
    // ║ [BLOCK:CLOSING] Final Seal                                                        ║ ║                              ║
    // ╠═════════════════════════════════════════════════════════════════════════════════╣ ║                              ║
    // ║ ║                                                                                 ║ ║                              ║
    // ║ ║ Note: The Game is the Realization.                                            ║ ║           [BLOCK:ROOT-->END] ║
    // ║ ╚═════════════════════════════════════════════════════════════════════════════════╝ ║                              ║
    // ║                                                                                     ║                              ║
    // ╚═════════════════════════════════════════════════════════════════════════════════════╩══════════════════════════════╝
}
