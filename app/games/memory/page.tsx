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

const MAX_LEVEL = 29;

// Dynamic Level Generation
const getLevelConfig = (level: number): LevelConfig => {
    // 1-5: Standard progression
    if (level === 1) return { rows: 3, cols: 4, time: 30 };
    if (level === 2) return { rows: 4, cols: 4, time: 45 };
    if (level === 3) return { rows: 4, cols: 5, time: 60 };
    if (level === 4) return { rows: 4, cols: 6, time: 75 };

    // Level 5 and beyond: Max Grid (5x6 = 30 cards)
    const baseTime = 90;
    // Decrease time by 2s per level after 5
    const timePenalty = (level - 5) * 2;
    const time = Math.max(30, baseTime - timePenalty); // Floor at 30s

    return { rows: 5, cols: 6, time };
};

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
    const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'gameover' | 'won-all'>('start');
    const [timeLeft, setTimeLeft] = useState(0);
    const [moves, setMoves] = useState(0);

    const currentConfig = getLevelConfig(level);

    // Init Level
    const startLevel = useCallback((lvl: number) => {
        const config = getLevelConfig(lvl);
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
        if (level < MAX_LEVEL) {
            startLevel(level + 1);
        } else {
            setGameState('won-all');
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
                            Level {level}/{MAX_LEVEL} • Moves: {moves}
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
                        <h2 className="text-2xl font-bold">Memory Challenge</h2>
                        <p className="text-muted-foreground">
                            Memorize and find pairs.
                            <br /><span className="text-xs font-mono mt-2 block">Level 1: 12 Cards • 30s</span>
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
                                        className="aspect-square"
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
            {(gameState === 'won' || gameState === 'gameover' || gameState === 'won-all') && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in fade-in duration-300">
                        {gameState === 'won' ? (
                            <>
                                <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold">Level {level} Cleared!</h2>
                                <p className="text-muted-foreground">Keep that memory sharp!</p>
                                <Button onClick={handleNextLevel} size="lg" className="w-full">
                                    Next Level
                                </Button>
                            </>
                        ) : gameState === 'won-all' ? (
                            <>
                                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mb-4">
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold">Memory Master! 🧠</h2>
                                <p className="text-muted-foreground">You beat all 29 levels.</p>
                                <Button onClick={() => startLevel(1)} size="lg" className="w-full">
                                    Start Over
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold">Time's Up!</h2>
                                <p className="text-muted-foreground">Try again, stay focused.</p>
                                <Button onClick={() => startLevel(level)} size="lg" className="w-full">
                                    Retry Level
                                </Button>
                            </>
                        )}

                        {(gameState !== 'won' && gameState !== 'won-all') && (
                            <Link href="/games" className="block w-full">
                                <Button variant="ghost" className="w-full">Exit to Menu</Button>
                            </Link>
                        )}
                        {gameState === 'won-all' && (
                            <Link href="/games" className="block w-full">
                                <Button variant="ghost" className="w-full">Exit to Menu</Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
