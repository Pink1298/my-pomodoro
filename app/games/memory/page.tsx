"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Ghost, Heart, Star, Cloud, Moon, Sun,
    Music, Coffee, Zap, Anchor, Umbrella, Key
} from "lucide-react";

// Game Config
const ICONS = [Ghost, Heart, Star, Cloud, Moon, Sun, Music, Coffee, Zap, Anchor, Umbrella, Key];
const GRID_SIZE = 16; // 4x4 grid (8 pairs)

interface Card {
    id: number;
    iconId: number;
    isFlipped: boolean;
    isMatched: boolean;
}

export default function MemoryGamePage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);

    // Initialize Game
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        // limit icons to needed pairs
        const pairsCount = GRID_SIZE / 2;
        const selectedIcons = ICONS.slice(0, pairsCount);

        // Create pairs
        const gameCards: Card[] = [...selectedIcons, ...selectedIcons].map((_, index) => ({
            id: index,
            iconId: index % pairsCount, // 0 to 7
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
        setIsWon(false);
    };

    const handleCardClick = (index: number) => {
        // Prevent clicking if already matched, already flipped, or 2 cards already flipped
        if (
            cards[index].isMatched ||
            cards[index].isFlipped ||
            flippedIndices.length >= 2
        ) return;

        // Flip the card
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

                    // Check Match Condition
                    if (newCards.every(c => c.isMatched)) {
                        setIsWon(true);
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

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-4xl min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/games">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-light text-foreground">Memory Match</h1>
                        <p className="text-sm text-muted-foreground">Moves: {moves}</p>
                    </div>
                </div>
                <Button onClick={startNewGame} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Restart
                </Button>
            </div>

            {/* Game Grid */}
            <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-4 gap-3 w-full max-w-md aspect-square">
                    {cards.map((card, index) => {
                        const Icon = ICONS[card.iconId];
                        return (
                            <motion.button
                                key={card.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCardClick(index)}
                                className={cn(
                                    "relative rounded-xl shadow-sm flex items-center justify-center text-3xl transition-all duration-300 transform perspective-1000",
                                    card.isFlipped || card.isMatched
                                        ? "bg-primary text-primary-foreground rotate-y-180"
                                        : "bg-secondary text-transparent hover:bg-secondary/80"
                                )}
                                disabled={card.isMatched}
                            >
                                {(card.isFlipped || card.isMatched) && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: 180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                    >
                                        <Icon className="h-8 w-8" />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Win Dialog Overlay */}
            {isWon && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                            <Trophy className="h-8 w-8" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold">Excellent!</h2>
                            <p className="text-muted-foreground">
                                You cleared the board in <span className="text-foreground font-medium">{moves} moves</span>.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <Link href="/games">
                                <Button variant="outline">Exit</Button>
                            </Link>
                            <Button onClick={startNewGame}>Play Again</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
