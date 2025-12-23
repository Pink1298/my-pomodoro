"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// 2048 Utils
const SIZE = 4;
type Grid = number[][];

export default function Game2048Page() {
    const [grid, setGrid] = useState<Grid>([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    // Initialize
    useEffect(() => {
        startNewGame();
    }, []);

    // Helper functions
    const createEmptyGrid = () => Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));

    const addRandomTile = (currentGrid: Grid) => {
        const available = [];
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (currentGrid[i][j] === 0) available.push({ r: i, c: j });
            }
        }
        if (available.length === 0) return currentGrid;

        const spot = available[Math.floor(Math.random() * available.length)];
        const newGrid = currentGrid.map(row => [...row]);
        newGrid[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
        return newGrid;
    };

    const startNewGame = () => {
        let newGrid = createEmptyGrid();
        newGrid = addRandomTile(newGrid);
        newGrid = addRandomTile(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
        setWon(false);
    };

    // Movement Logic
    const slide = (row: number[]) => {
        const filtered = row.filter(num => num !== 0);
        const missing = SIZE - filtered.length;
        const zeros = Array(missing).fill(0);
        return [...filtered, ...zeros];
    };

    const combine = (row: number[], currentScore: number) => {
        const newRow = [...row];
        let scoreAdd = 0;
        for (let i = 0; i < SIZE - 1; i++) {
            if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                newRow[i + 1] = 0;
                scoreAdd += newRow[i];
            }
        }
        return { row: newRow, score: scoreAdd };
    };

    const moveRight = (oldGrid: Grid) => {
        let newGrid = [...oldGrid];
        let scoreAdd = 0;

        for (let i = 0; i < SIZE; i++) {
            let row = newGrid[i];
            // 1. Slide Right (reverse, slide, reverse)
            row = row.reverse();
            row = slide(row);

            // 2. Combine
            const combined = combine(row, scoreAdd);
            row = combined.row;
            scoreAdd += combined.score;

            // 3. Slide again
            row = slide(row);
            newGrid[i] = row.reverse();
        }

        return { grid: newGrid, score: scoreAdd };
    };

    const moveLeft = (oldGrid: Grid) => {
        let newGrid = [...oldGrid];
        let scoreAdd = 0;

        for (let i = 0; i < SIZE; i++) {
            let row = newGrid[i];
            row = slide(row);
            const combined = combine(row, scoreAdd);
            row = combined.row;
            scoreAdd += combined.score;
            row = slide(row);
            newGrid[i] = row;
        }

        return { grid: newGrid, score: scoreAdd };
    };

    const moveDown = (oldGrid: Grid) => {
        // Transpose -> Move Right -> Transpose Back
        let newGrid = transpose(oldGrid);
        const result = moveRight(newGrid);
        return { grid: transpose(result.grid), score: result.score };
    };

    const moveUp = (oldGrid: Grid) => {
        // Transpose -> Move Left -> Transpose Back
        let newGrid = transpose(oldGrid);
        const result = moveLeft(newGrid);
        return { grid: transpose(result.grid), score: result.score };
    };

    const transpose = (matrix: Grid) => {
        return matrix[0].map((col, i) => matrix.map(row => row[i]));
    };

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (gameOver || won) return;

        // Prevent scrolling
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
            event.preventDefault();
        }

        let result = { grid: grid, score: 0 };
        let moved = false;

        switch (event.key) {
            case "ArrowLeft": result = moveLeft(grid); break;
            case "ArrowRight": result = moveRight(grid); break;
            case "ArrowUp": result = moveUp(grid); break;
            case "ArrowDown": result = moveDown(grid); break;
            default: return;
        }

        // Check change
        if (JSON.stringify(grid) !== JSON.stringify(result.grid)) {
            moved = true;
            const newGrid = addRandomTile(result.grid);
            setGrid(newGrid);
            setScore(s => s + result.score);

            // Check Win
            if (newGrid.flat().includes(2048)) setWon(true);

            // Check Loss (if full and no moves possible) - simplified check
            if (newGrid.flat().every(v => v !== 0)) {
                // Should check if any merge possible
                setGameOver(isGameOver(newGrid));
            }
        }
    }, [grid, gameOver, won]);

    const isGameOver = (checkGrid: Grid) => {
        // Check simple moves
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const val = checkGrid[i][j];
                if (j < SIZE - 1 && checkGrid[i][j + 1] === val) return false;
                if (i < SIZE - 1 && checkGrid[i + 1][j] === val) return false;
            }
        }
        return true;
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);


    // Tile Colors
    const getTileColor = (val: number) => {
        const colors: Record<number, string> = {
            2: "bg-stone-200 text-stone-700",
            4: "bg-stone-300 text-stone-800",
            8: "bg-orange-200 text-orange-800",
            16: "bg-orange-300 text-orange-900",
            32: "bg-orange-400 text-white",
            64: "bg-orange-500 text-white",
            128: "bg-yellow-400 text-white",
            256: "bg-yellow-500 text-white",
            512: "bg-yellow-600 text-white",
            1024: "bg-yellow-700 text-white",
            2048: "bg-yellow-800 text-white"
        };
        return colors[val] || "bg-stone-900 text-white";
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-lg min-h-screen flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/games">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">2048</h1>
                        <p className="text-sm text-muted-foreground">Score: {score}</p>
                    </div>
                </div>
                <Button onClick={startNewGame} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reset
                </Button>
            </div>

            {/* Game Board */}
            <div className="bg-[#bbada0] p-4 rounded-xl shadow-lg">
                <div className="grid grid-cols-4 gap-3">
                    {grid.map((row, r) => (
                        row.map((val, c) => (
                            <div
                                key={`${r}-${c}`}
                                className={cn(
                                    "w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-100",
                                    val === 0 ? "bg-[#cdc1b4]" : getTileColor(val)
                                )}
                            >
                                {val !== 0 ? val : ""}
                            </div>
                        ))
                    ))}
                </div>
            </div>

            <p className="mt-8 text-muted-foreground text-sm">
                Use <span className="font-bold">Arrow Keys</span> to move tiles. Combine same numbers to reach 2048!
            </p>

            {/* Overlay */}
            {(gameOver || won) && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card p-8 rounded-2xl shadow-2xl text-center space-y-6">
                        <h2 className="text-4xl font-bold">{won ? "You Won!" : "Game Over"}</h2>
                        <Button onClick={startNewGame} size="lg">Try Again</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
