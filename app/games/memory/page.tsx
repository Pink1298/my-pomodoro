"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Trophy, Timer as TimerIcon, Play, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Ghost, Heart, Star, Cloud, Moon, Sun,
    Music, Coffee, Zap, Anchor, Umbrella, Key,
    Smile, Bell, Gift, Camera
} from "lucide-react";

// Game Config
// 16 icons to support up to 32 cards (8x4 max, though we likely stop at 6x4 or 5x6)
const ICONS = [
    Ghost, Heart, Star, Cloud, Moon, Sun,
    Music, Coffee, Zap, Anchor, Umbrella, Key,
    Smile, Bell, Gift, Camera
];

interface LevelConfig {
    rows: number;
    cols: number;
    time: number; // seconds
}

// Define Levels
const LEVELS: LevelConfig[] = [
    { rows: 3, cols: 4, time: 30 },  // Level 1: 12 cards (6 pairs)
    { rows: 4, cols: 4, time: 45 },  // Level 2: 16 cards (8 pairs)
    { rows: 4, cols: 5, time: 60 },  // Level 3: 20 cards (10 pairs)
    { rows: 4, cols: 6, time: 75 },  // Level 4: 24 cards (12 pairs)
    { rows: 5, cols: 6, time: 90 },  // Level 5: 30 cards (15 pairs)
];

interface Card {
    id: number;
    iconId: number;
    isFlipped: boolean;
    isMatched: boolean;
}

export default function MemoryGamePage() {
    // State
    const [level, setLevel] = useState(1);
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'gameover'>('start');
    const [timeLeft, setTimeLeft] = useState(0);
    const [moves, setMoves] = useState(0);

    const currentConfig = LEVELS[Math.min(level - 1, LEVELS.length - 1)];

    // Init Level
    const startLevel = useCallback((lvl: number) => {
        const config = LEVELS[Math.min(lvl - 1, LEVELS.length - 1)];
        const totalCards = config.rows * config.cols;
        const pairsCount = totalCards / 2;

        const selectedIcons = ICONS.slice(0, pairsCount);
        // Create pairs
        const gameCards: Card[] = [...selectedIcons, ...selectedIcons].map((_, index) => ({
            id: index,
            iconId: index % pairsCount,
            isFlipped: false,
            isMatched: false,
        }));

        // Shuffle
        for (let i = gameCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
        }

        setCards(gameCards);
        setFlippedIndices([]);
        setMoves(0);
        setTimeLeft(config.time);
        setGameState('playing');
        setLevel(lvl);
    }, []);

    // Timer Logic
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameState('gameover');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);

    // Handle Card Click
    const handleCardClick = (index: number) => {
        if (gameState !== 'playing') return;

        // Prevent clicking if already matched, already flipped, or 2 cards already flipped
        if (
            cards[index].isMatched ||
            cards[index].isFlipped ||
            flippedIndices.length >= 2
        ) return;

        // Flip logic
        const newCards = [...cards];
        newCards[index].isFlipped = true;
        setCards(newCards);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        // Check for match
        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [firstIndex, secondIndex] = newFlipped;

            if (newCards[firstIndex].iconId === newCards[secondIndex].iconId) {
                // Match!
                setTimeout(() => {
                    newCards[firstIndex].isMatched = true;
                    newCards[secondIndex].isMatched = true;
                    setCards([...newCards]);
                    setFlippedIndices([]);

                    // Check Win Condition
                    if (newCards.every(c => c.isMatched)) {
                        setGameState('won');
                    }
                }, 500);
            } else {
                // No Match
                setTimeout(() => {
                    newCards[firstIndex].isFlipped = false;
                    newCards[secondIndex].isFlipped = false;
                    setCards([...newCards]);
                    setFlippedIndices([]);
                }, 1000);
            }
        }
    };

    const handleNextLevel = () => {
        if (level < LEVELS.length) {
            startLevel(level + 1);
        } else {
            // Replay last level or loop? Let's just replay last for now
            startLevel(LEVELS.length);
        }
    };

    // Calculate grid classes dynamically based on cols
    const getGridColsClass = (cols: number) => {
        switch (cols) {
            case 3: return "grid-cols-3";
            case 4: return "grid-cols-4";
            case 5: return "grid-cols-5";
            case 6: return "grid-cols-6";
            default: return "grid-cols-4";
        }
    };

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-4xl min-h-screen flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/games">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-light text-foreground">Memory Match</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                            Level {level} • Moves: {moves}
                        </p>
                    </div>
                </div>

                {gameState === 'playing' && (
                    <div className={cn(
                        "flex items-center gap-2 font-mono text-xl font-bold transition-colors",
                        timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-primary"
                    )}>
                        <TimerIcon className="h-5 w-5" />
                        {timeLeft}s
                    </div>
                )}

                <Button onClick={() => startLevel(level)} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reset
                </Button>
            </div>

            {/* Game Area */}
            {gameState === 'start' ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in">
                    <div className="p-8 bg-card rounded-3xl shadow-lg border border-border text-center space-y-4 max-w-sm">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trophy className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold">Ready to Focus?</h2>
                        <p className="text-muted-foreground">
                            Memorize the cards and find all pairs before time runs out.
                            <br /><span className="text-xs font-mono mt-2 block">Level 1 • 30 Seconds</span>
                        </p>
                        <Button size="lg" className="w-full" onClick={() => startLevel(1)}>
                            Start Game <Play className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center w-full">
                    <div className={cn(
                        "grid gap-3 w-full max-w-2xl mx-auto transition-all duration-300",
                        getGridColsClass(currentConfig.cols)
                    )}>
                        <AnimatePresence>
                            {cards.map((card, index) => {
                                const Icon = ICONS[card.iconId];
                                return (
                                    <motion.div
                                        key={card.id}
                                        layout
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="aspect-square" // Enforce square aspect ratio on container
                                    >
                                        <button
                                            onClick={() => handleCardClick(index)}
                                            disabled={card.isMatched}
                                            className={cn(
                                                "w-full h-full rounded-xl shadow-sm flex items-center justify-center text-3xl transition-all duration-300 transform perspective-1000 border-2",
                                                card.isFlipped || card.isMatched
                                                    ? "bg-primary border-primary text-primary-foreground rotate-y-180"
                                                    : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/80 text-transparent"
                                            )}
                                        >
                                            {/* Icon Container: Absolute to center and avoid layout shift */}
                                            <div className="flex items-center justify-center">
                                                {(card.isFlipped || card.isMatched) && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: 180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                                    >
                                                        <Icon className="h-8 w-8 md:h-10 md:w-10" />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Overlays */}
            {(gameState === 'won' || gameState === 'gameover') && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in fade-in duration-300">
                        {gameState === 'won' ? (
                            <>
                                <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold">Level {level} Complete!</h2>
                                <p className="text-muted-foreground">Great memory! Ready for the next challenge?</p>
                                <Button onClick={handleNextLevel} size="lg" className="w-full">
                                    {level < LEVELS.length ? "Next Level" : "Play Again"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold">Time's Up!</h2>
                                <p className="text-muted-foreground">Don't give up. Try again!</p>
                                <Button onClick={() => startLevel(level)} size="lg" className="w-full">
                                    Retry Level
                                </Button>
                            </>
                        )}

                        <Link href="/games" className="block w-full">
                            <Button variant="ghost" className="w-full">Exit to Menu</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
