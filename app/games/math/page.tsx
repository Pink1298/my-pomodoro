"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Timer, Trophy, AlertCircle, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LevelConfig {
    id: number;
    ops: ('+' | '-' | '*')[];
    range: number; // max number value
    goal: number;  // score needed to pass
    time: number;  // seconds
    description: string;
}

const MAX_LEVEL = 29;

// Dynamic Level Generation
const getLevelConfig = (level: number): LevelConfig => {
    // Base Configs for early levels
    if (level === 1) return { id: 1, ops: ['+'], range: 10, goal: 5, time: 20, description: "Simple Addition" };
    if (level === 2) return { id: 2, ops: ['+', '-'], range: 20, goal: 8, time: 25, description: "Add & Subtract" };
    if (level === 3) return { id: 3, ops: ['*'], range: 10, goal: 8, time: 25, description: "Multiplication" };
    if (level === 4) return { id: 4, ops: ['+', '-', '*'], range: 20, goal: 10, time: 30, description: "Mixed Operations" };
    if (level === 5) return { id: 5, ops: ['+', '-', '*'], range: 50, goal: 12, time: 35, description: "Junior Speedster" };

    // Procedural generation for 6-29
    // Ops: Always mixed from 6 onwards
    const ops: ('+' | '-' | '*')[] = ['+', '-', '*'];

    // Range: Increases every 5 levels
    const rangeStep = Math.floor((level - 5) / 5);
    const range = 50 + (rangeStep * 20); // 50, 70, 90, 110, 130...

    // Goal: Increases by 1 every 2 levels
    const goal = 12 + Math.floor((level - 5) / 2);

    // Time: Base 30s + 2s per goal increase, roughly
    // Basically keep it tight: 2-3s per question required
    const time = Math.floor(goal * 2.5); // 2.5s per question

    return {
        id: level,
        ops,
        range,
        goal,
        time,
        description: `Level ${level}`
    };
};

interface Problem {
    text: string;
    answer: number;
    options: number[];
}

export default function MathRushPage() {
    const [level, setLevel] = useState(1);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'level-up' | 'gameover' | 'won-all'>('start');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [problem, setProblem] = useState<Problem | null>(null);

    const currentConfig = getLevelConfig(level);

    const generateProblem = useCallback(() => {
        const config = getLevelConfig(level);
        const op = config.ops[Math.floor(Math.random() * config.ops.length)];

        let n1 = Math.floor(Math.random() * config.range) + 2;
        let n2 = Math.floor(Math.random() * config.range) + 2;

        // Simpler multiplication logic to avoid massive numbers
        if (op === '*') {
            const maxFactor = Math.min(12 + Math.floor(level / 2), config.range); // Cap factors
            n1 = Math.floor(Math.random() * maxFactor) + 2;
            n2 = Math.floor(Math.random() * maxFactor) + 2;
        }

        // Proper Subtraction
        if (op === '-') {
            if (n1 < n2) [n1, n2] = [n2, n1];
        }

        let answer = 0;
        let text = "";

        switch (op) {
            case '+': answer = n1 + n2; text = `${n1} + ${n2}`; break;
            case '-': answer = n1 - n2; text = `${n1} - ${n2}`; break;
            case '*': answer = n1 * n2; text = `${n1} × ${n2}`; break;
        }

        // Generate options
        const options = new Set<number>();
        options.add(answer);
        while (options.size < 3) {
            // Smart variance based on size of answer
            const variance = Math.max(5, Math.floor(answer * 0.2));
            const offset = Math.floor(Math.random() * (variance * 2)) - variance;
            const wrong = answer + offset;
            if (wrong !== answer && wrong >= 0) options.add(wrong);
        }

        const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
        while (shuffledOptions.length < 3) {
            shuffledOptions.push(shuffledOptions[0] + 1);
        }

        setProblem({
            text,
            answer,
            options: shuffledOptions
        });
    }, [level]);

    const startLevel = (lvl: number) => {
        setLevel(lvl);
        const config = getLevelConfig(lvl);
        setScore(0);
        setTimeLeft(config.time);
        setGameState('playing');
        generateProblem();
    };

    const handleAnswer = (val: number) => {
        if (gameState !== 'playing' || !problem) return;

        if (val === problem.answer) {
            const newScore = score + 1;
            setScore(newScore);

            // Check Level Goal
            if (newScore >= currentConfig.goal) {
                if (level < MAX_LEVEL) {
                    setGameState('level-up');
                } else {
                    setGameState('won-all');
                }
            } else {
                generateProblem();
            }
        } else {
            // Penalty: lose time
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
            {/* Header */}
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
                            Goal: {score}/{currentConfig.goal}
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

            {/* Start Screen */}
            {gameState === 'start' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Zap className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-foreground">Math Rush</h1>
                        <p className="text-muted-foreground">Level {level}</p>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-xl w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Goal:</span>
                            <span className="font-bold">{currentConfig.goal} correct</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-bold">{currentConfig.time}s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ops:</span>
                            <span className="font-bold tracking-widest">{currentConfig.ops.join(' ')}</span>
                        </div>
                    </div>

                    <Button size="lg" onClick={() => startLevel(level)} className="w-full text-lg h-12">
                        Start Game <Play className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}

            {/* Playing Area */}
            {gameState === 'playing' && problem && (
                <div className="flex-1 w-full flex flex-col items-center justify-center space-y-12 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center space-y-2">
                        <h2 className="text-7xl font-black text-foreground tabular-nums tracking-tight">{problem.text}</h2>
                        <p className="text-muted-foreground text-lg">= ?</p>
                    </div>

                    <div className="grid grid-cols-1 w-full gap-4">
                        {problem.options.map((opt, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                className="h-20 text-4xl font-light hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 transition-all"
                                onClick={() => handleAnswer(opt)}
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Level Up Overlay */}
            {gameState === 'level-up' && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in fade-in">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <Trophy className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold">Level {level} Cleared!</h2>

                        {level < MAX_LEVEL ? (
                            <>
                                <div className="p-4 bg-secondary/50 rounded-xl space-y-1">
                                    <p className="text-xs uppercase text-muted-foreground font-bold">Next: Level {level + 1}</p>
                                    <p className="text-sm text-balance text-muted-foreground">{getLevelConfig(level + 1).description}</p>
                                </div>
                                <Button onClick={() => startLevel(level + 1)} size="lg" className="w-full">
                                    Next Level <Play className="ml-2 h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setGameState('won-all')} size="lg" className="w-full">
                                Claim Victory
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Game Over / Won All Overlay */}
            {(gameState === 'gameover' || gameState === 'won-all') && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 animate-in zoom-in fade-in">
                        {gameState === 'won-all' ? (
                            <>
                                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mb-4">
                                    <Trophy className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold">Grandmaster! 👑</h2>
                                <p className="text-muted-foreground">You conquered all 29 levels.</p>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold">Time's Up!</h2>
                                <p className="text-muted-foreground">Level {level} got the best of you.</p>
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
