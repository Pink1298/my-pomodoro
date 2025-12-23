"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Timer, Flame, Trophy, AlertCircle, RefreshCw } from "lucide-react";
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

const MAX_LEVEL = 29;

interface LevelConfig {
    questions: number;
    time: number;
}

const getLevelConfig = (level: number): LevelConfig => {
    // Base: 5 questions in 20 seconds (4s / q)
    // Level 29: ~45 questions in 60 seconds (~1.3s / q)

    const questions = 5 + Math.floor((level - 1) * 1.5); // 5, 6, 8, 9, 11... -> 47 at lvl 29

    // Time per question calculation
    // Start at 4s, decay towards 1.2s
    const timePerQ = Math.max(1.2, 4 - (level * 0.1));
    const time = Math.ceil(questions * timePerQ);

    return { questions, time };
}

export default function StroopTestPage() {
    const [level, setLevel] = useState(1);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'level-up' | 'gameover' | 'won-all'>('start');
    const [score, setScore] = useState(0);
    const [currentLevelScore, setCurrentLevelScore] = useState(0); // Score within current level
    const [timeLeft, setTimeLeft] = useState(0);

    // Current challenge
    const [word, setWord] = useState(COLORS[0]);
    const [inkColor, setInkColor] = useState(COLORS[1]);
    const [options, setOptions] = useState<typeof COLORS>([]);

    const currentConfig = getLevelConfig(level);

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

    const startLevel = (lvl: number) => {
        setLevel(lvl);
        const config = getLevelConfig(lvl);
        setCurrentLevelScore(0);
        setTimeLeft(config.time);
        setGameState('playing');
        generateRound();
    };

    const handleAnswer = (selectedName: string) => {
        if (gameState !== 'playing') return;

        if (selectedName === inkColor.name) {
            const newScore = currentLevelScore + 1;
            setCurrentLevelScore(newScore);
            setScore(s => s + 1); // Total accumulated score

            // Check Level Goal
            if (newScore >= currentConfig.questions) {
                if (level < MAX_LEVEL) {
                    setGameState('level-up');
                } else {
                    setGameState('won-all');
                }
            } else {
                generateRound();
            }
        } else {
            // Penalty
            setTimeLeft(t => Math.max(0, t - 3));
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

                <div className="text-center">
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                        Level {level}/{MAX_LEVEL}
                    </div>
                    {gameState === 'playing' && (
                        <div className="text-xs text-muted-foreground">
                            Goal: {currentLevelScore}/{currentConfig.questions}
                        </div>
                    )}
                </div>

                <div className={cn(
                    "flex items-center gap-2 font-mono text-xl font-bold transition-colors",
                    timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-primary"
                )}>
                    <Timer className="h-5 w-5" />
                    {timeLeft}s
                </div>
            </div>

            {gameState === 'start' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in">
                    <h1 className="text-4xl font-bold text-primary">Stroop Test</h1>
                    <p className="text-muted-foreground w-64">
                        Match the <span className="font-bold underline text-foreground">INK COLOR</span>, ignore the word text!
                    </p>
                    <div className="border p-4 rounded-xl bg-card w-full max-w-xs">
                        <span className="text-4xl font-black text-red-500">BLUE</span>
                        <p className="text-xs text-muted-foreground mt-2">Correct Answer: <strong>RED</strong></p>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-xl w-full text-sm space-y-1">
                        <p className="font-bold">Level 1 Goal</p>
                        <p>5 Correct in 20s</p>
                    </div>

                    <Button size="lg" onClick={() => startLevel(1)} className="w-full text-lg h-12">
                        Start Level 1 <Play className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="flex-1 w-full flex flex-col items-center justify-center space-y-12">
                    <div className="text-center space-y-4">
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
                                variant="outline"
                                className="h-20 text-xl font-bold hover:scale-105 active:scale-95 transition-all uppercase"
                                onClick={() => handleAnswer(opt.name)}
                            >
                                {opt.name}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'level-up' && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in fade-in">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <Flame className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold">Level {level} Done!</h2>
                        <div className="p-4 bg-secondary/50 rounded-xl space-y-1">
                            <p className="text-xs uppercase text-muted-foreground font-bold">Next: Level {level + 1}</p>
                            <p className="text-lg font-medium">{getLevelConfig(level + 1).questions} Matches</p>
                            <p className="text-sm text-muted-foreground">Time: {getLevelConfig(level + 1).time}s</p>
                        </div>
                        <Button onClick={() => startLevel(level + 1)} size="lg" className="w-full">
                            Next Challenge
                        </Button>
                    </div>
                </div>
            )}

            {(gameState === 'gameover' || gameState === 'won-all') && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in fade-in">
                        {gameState === 'won-all' ? (
                            <>
                                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mb-4">
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold">Unstoppable! 🧠</h2>
                                <p className="text-muted-foreground">Level 29 Conquered.</p>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold">Brain Freeze!</h2>
                                <p className="text-muted-foreground">You reached Level {level}.</p>
                            </>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button onClick={() => startLevel(level)} size="lg" className="w-full">
                                {gameState === 'won-all' ? "Play Again" : "Retry Level"}
                            </Button>
                            <Link href="/games" className="w-full">
                                <Button variant="ghost" className="w-full">Exit</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
