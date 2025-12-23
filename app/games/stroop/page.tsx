"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Timer, Flame } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COLORS = [
    { name: "RED", value: "text-red-500", bg: "bg-red-500" },
    { name: "BLUE", value: "text-blue-500", bg: "bg-blue-500" },
    { name: "GREEN", value: "text-green-500", bg: "bg-green-500" },
    { name: "YELLOW", value: "text-yellow-500", bg: "bg-yellow-500" },
    { name: "PURPLE", value: "text-purple-500", bg: "bg-purple-500" },
    { name: "ORANGE", value: "text-orange-500", bg: "bg-orange-500" },
];

export default function StroopTestPage() {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);

    // Current challenge
    const [word, setWord] = useState(COLORS[0]);
    const [inkColor, setInkColor] = useState(COLORS[1]);
    const [options, setOptions] = useState<typeof COLORS>([]);

    const generateRound = useCallback(() => {
        const textChoice = COLORS[Math.floor(Math.random() * COLORS.length)];
        const inkChoice = COLORS[Math.floor(Math.random() * COLORS.length)];

        setWord(textChoice);
        setInkColor(inkChoice);

        // Options: Always include Correct Answer (inkChoice) and randoms
        const opts = [inkChoice];
        while (opts.length < 4) {
            const r = COLORS[Math.floor(Math.random() * COLORS.length)];
            if (!opts.find(o => o.name === r.name)) opts.push(r);
        }
        setOptions(opts.sort(() => Math.random() - 0.5));
    }, []);

    const startGame = () => {
        setScore(0);
        setTimeLeft(45);
        setGameState('playing');
        generateRound();
    };

    const handleAnswer = (selectedName: string) => {
        if (selectedName === inkColor.name) {
            setScore(s => s + 1);
            generateRound();
        } else {
            // Wrong answer!
            setTimeLeft(t => Math.max(0, t - 3)); // penalty
        }
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameState('gameover');
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState]);


    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-md min-h-screen flex flex-col items-center">

            <div className="w-full flex items-center justify-between mb-8">
                <Link href="/games">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-2 font-mono text-xl">
                    <Timer className="h-5 w-5" />
                    {timeLeft}s
                </div>
            </div>

            {gameState === 'start' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                    <h1 className="text-4xl font-bold text-primary">Stroop Test</h1>
                    <p className="text-muted-foreground w-64">
                        Click the button that matches the <span className="font-bold underline text-foreground">INK COLOR</span> of the word, not the word itself!
                    </p>
                    <div className="border p-4 rounded-xl bg-card">
                        <span className="text-4xl font-black text-red-500">BLUE</span>
                        <p className="text-xs text-muted-foreground mt-2">(Correct Answer: RED)</p>
                    </div>

                    <Button size="lg" onClick={startGame} className="w-full text-lg h-12">
                        Start Game <Play className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="flex-1 w-full flex flex-col items-center justify-center space-y-12">
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" /> Score: {score}
                        </p>
                        <div className="h-32 flex items-center justify-center">
                            <h2 className={cn("text-6xl font-black transition-all duration-300 transform scale-125", inkColor.value)}>
                                {word.name}
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 w-full gap-4">
                        {options.map((opt, i) => (
                            <Button
                                key={i}
                                variant="outline" // Don't use color bg to confuse them!
                                className="h-20 text-xl font-bold hover:scale-105 active:scale-95 transition-all uppercase"
                                onClick={() => handleAnswer(opt.name)}
                            >
                                {opt.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in">
                    <h2 className="text-3xl font-bold">Brain Fried? 🧠</h2>
                    <div className="text-6xl font-black text-primary">{score}</div>
                    <p className="text-muted-foreground">Correct Matches</p>

                    <div className="flex flex-col w-full gap-3 pt-4">
                        <Button size="lg" onClick={startGame}>Play Again</Button>
                        <Link href="/games" className="w-full">
                            <Button variant="outline" className="w-full">Exit</Button>
                        </Link>
                    </div>
                </div>
            )}

        </div>
    );
}
