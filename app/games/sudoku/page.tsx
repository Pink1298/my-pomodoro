"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Eraser, Pencil, Trophy, Settings2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { generateSudoku, BLANK } from "@/lib/sudoku-utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Difficulty = 'Easy' | 'Medium' | 'Hard';

export default function SudokuPage() {
    // Game State
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [initialBoard, setInitialBoard] = useState<number[][]>([]);
    const [board, setBoard] = useState<number[][]>([]);
    const [solution, setSolution] = useState<number[][]>([]);
    const [notes, setNotes] = useState<number[][][]>([]);

    // UI State
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [mistakes, setMistakes] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [isPencilMode, setIsPencilMode] = useState(false);

    // Initialize Game
    useEffect(() => {
        startNewGame(difficulty);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const startNewGame = (diff: Difficulty) => {
        const { initial, solution: sol } = generateSudoku(diff);
        setInitialBoard(JSON.parse(JSON.stringify(initial)));
        setBoard(JSON.parse(JSON.stringify(initial)));
        setSolution(sol);

        const emptyNotes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
        setNotes(emptyNotes);

        setMistakes(0);
        setIsWon(false);
        setSelectedCell(null);
        setDifficulty(diff);
    };

    const handleCellClick = (row: number, col: number) => {
        setSelectedCell([row, col]);
    };

    const handleNumberInput = (num: number) => {
        if (!selectedCell || isWon) return;
        const [r, c] = selectedCell;

        // Cannot edit initial cells
        if (initialBoard[r][c] !== BLANK) return;

        if (isPencilMode) {
            // Toggle note
            const newNotes = [...notes];
            const cellNotes = [...newNotes[r][c]];
            if (cellNotes.includes(num)) {
                newNotes[r][c] = cellNotes.filter(n => n !== num);
            } else {
                newNotes[r][c] = [...cellNotes, num].sort();
            }
            setNotes(newNotes);
        } else {
            // Enter Number
            const newBoard = [...board];
            newBoard[r][c] = num;
            setBoard(newBoard);

            // Clear notes
            const newNotes = [...notes];
            newNotes[r][c] = [];
            setNotes(newNotes);

            // Check correctness logic
            if (num !== solution[r][c]) {
                setMistakes(m => m + 1);
            } else {
                checkWin(newBoard);
            }
        }
    };

    const handleErase = () => {
        if (!selectedCell || isWon) return;
        const [r, c] = selectedCell;
        if (initialBoard[r][c] !== BLANK) return;

        const newBoard = [...board];
        newBoard[r][c] = BLANK;
        setBoard(newBoard);

        const newNotes = [...notes];
        newNotes[r][c] = [];
        setNotes(newNotes);
    };

    const checkWin = (currentBoard: number[][]) => {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (currentBoard[i][j] !== solution[i][j]) return;
            }
        }
        setIsWon(true);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isWon) return;
            const key = e.key;
            if (key >= '1' && key <= '9') handleNumberInput(parseInt(key));
            if (key === 'Backspace' || key === 'Delete') handleErase();
            if (key === 'p') setIsPencilMode(!isPencilMode);

            if (!selectedCell) return;
            const [r, c] = selectedCell;
            if (key === 'ArrowUp') setSelectedCell([Math.max(0, r - 1), c]);
            if (key === 'ArrowDown') setSelectedCell([Math.min(8, r + 1), c]);
            if (key === 'ArrowLeft') setSelectedCell([r, Math.max(0, c - 1)]);
            if (key === 'ArrowRight') setSelectedCell([r, Math.min(8, c + 1)]);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, isPencilMode, isWon, board]);

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-lg min-h-screen flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/games">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-light text-foreground">Sudoku</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                            {difficulty} • Mistakes: <span className={mistakes >= 3 ? "text-red-500" : ""}>{mistakes}</span>
                        </p>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Settings2 className="h-4 w-4" />
                            {difficulty}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startNewGame('Easy')}>Easy</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startNewGame('Medium')}>Medium</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => startNewGame('Hard')}>Hard</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Redesigned Board: 3x3 Block Grid */}
            <div className="bg-black p-1 rounded-xl shadow-2xl overflow-hidden inline-block">
                <div className="grid grid-cols-3 gap-[2px] bg-black border-[2px] border-black rounded-lg overflow-hidden">
                    {/* Iterate 9 Blocks */}
                    {Array.from({ length: 9 }).map((_, blockIndex) => (
                        <div key={blockIndex} className="grid grid-cols-3 gap-[1px] bg-stone-300 dark:bg-stone-600">
                            {/* Iterate 9 Cells in Block */}
                            {Array.from({ length: 9 }).map((_, cellIndex) => {
                                // Calculate Global Coordinates
                                const r = Math.floor(blockIndex / 3) * 3 + Math.floor(cellIndex / 3);
                                const c = (blockIndex % 3) * 3 + (cellIndex % 3);

                                const cell = board[r]?.[c] ?? 0;
                                const isInitial = initialBoard[r]?.[c] !== BLANK;
                                const cellValue = cell !== BLANK ? cell : null;
                                const cellNotes = notes[r]?.[c] || [];

                                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                                const isError = !isInitial && cell !== BLANK && cell !== solution[r][c];

                                // Highlighting
                                const isRelated = selectedCell && !isSelected && (
                                    selectedCell[0] === r ||
                                    selectedCell[1] === c ||
                                    (Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
                                        Math.floor(selectedCell[1] / 3) === Math.floor(c / 3))
                                );
                                const isSameNumber = selectedCell && board[selectedCell[0]][selectedCell[1]] !== BLANK && board[selectedCell[0]][selectedCell[1]] === cell;

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => handleCellClick(r, c)}
                                        className={cn(
                                            "w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center cursor-pointer transition-colors duration-75 relative",
                                            // Base Background
                                            "bg-white dark:bg-stone-900",
                                            // Highlight Priorities
                                            isRelated && "bg-blue-50 dark:bg-blue-900/10",
                                            isSameNumber && !isSelected && "bg-blue-200 dark:bg-blue-800/30",
                                            isSelected && "bg-[#3B5BDB] text-white", // Deep Blue selection
                                            isError && !isSelected && "text-red-500 bg-red-50",
                                            isError && isSelected && "bg-red-500 text-white",

                                            // Text Styling
                                            isInitial ? "font-bold text-foreground" : "font-semibold text-[#3B5BDB] dark:text-blue-400",
                                            isSelected && "text-white" // Override for selected
                                        )}
                                    >
                                        {cellValue}
                                        {/* Notes */}
                                        {!cellValue && cellNotes.length > 0 && (
                                            <div className="grid grid-cols-3 gap-[1px] w-full h-full p-0.5 pointer-events-none">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                                    <div key={n} className="flex items-center justify-center text-[8px] leading-none text-stone-400">
                                                        {cellNotes.includes(n) ? n : ''}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 w-full max-w-sm space-y-6">
                <div className="flex justify-between px-4">
                    <Button
                        variant={isPencilMode ? "default" : "secondary"}
                        size="icon"
                        className="rounded-full h-12 w-12 shadow-sm"
                        onClick={() => setIsPencilMode(!isPencilMode)}
                        title="Pencil Mode (P)"
                    >
                        <Pencil className="h-5 w-5" />
                        {isPencilMode && <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />}
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full h-12 w-12 shadow-sm" onClick={handleErase} title="Erase (Del)">
                        <Eraser className="h-5 w-5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full h-12 w-12 shadow-sm" onClick={() => startNewGame(difficulty)} title="New Game">
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                </div>

                <div className="grid grid-cols-9 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <Button
                            key={num}
                            variant="outline"
                            className="h-12 text-xl font-light hover:bg-primary hover:text-primary-foreground transition-all rounded-lg"
                            onClick={() => handleNumberInput(num)}
                        >
                            {num}
                        </Button>
                    ))}
                </div>

                {/* Legend / Status */}
                <div className="flex justify-center gap-6 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#3B5BDB] rounded-sm"></div> Selected
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-sm"></div> Error
                    </div>
                </div>
            </div>

            {isWon && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in fade-in duration-300">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                            <Trophy className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold">Puzzle Solved!</h2>
                        <p className="text-muted-foreground">Excellent mental workout.</p>
                        <Button onClick={() => startNewGame(difficulty)} size="lg" className="w-full">Play Again</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
