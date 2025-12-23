"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Timer } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Problem {
    text: string;
    answer: number;
    options: number[];
}

export default function MathRushPage() {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [problem, setProblem] = useState<Problem | null>(null);

    const generateProblem = useCallback(() => {
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];

        let n1 = Math.floor(Math.random() * 10) + 1;
        let n2 = Math.floor(Math.random() * 10) + 1;

        // Simplify logic for speed
        if (op === '*') {
            n1 = Math.floor(Math.random() * 9) + 1; // 1-9
            n2 = Math.floor(Math.random() * 9) + 1;
        } else if (op === '-') {
            if (n1 < n2) [n1, n2] = [n2, n1]; // ensure positive
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
            const offset = Math.floor(Math.random() * 10) - 5;
            const wrong = answer + offset;
            if (wrong !== answer && wrong >= 0) options.add(wrong);
        }

        setProblem({
            text,
            answer,
            options: Array.from(options).sort(() => Math.random() - 0.5)
        });
    }, []);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30); // 30 seconds rush
        setGameState('playing');
        generateProblem();
    };

    const handleAnswer = (val: number) => {
        if (!problem) return;
        if (val === problem.answer) {
            setScore(s => s + 1);
            generateProblem();
        } else {
            // Penalty? Or Game Over?
            // Let's do penalty for now
            setTimeLeft(t => Math.max(0, t - 2));
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
                    <h1 className="text-4xl font-bold text-primary">Math Rush</h1>
                    <p className="text-muted-foreground">Solve as many problems as you can in 30 seconds!</p>
                    <Button size="lg" onClick={startGame} className="w-full text-lg h-12">
                        Start Game <Play className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}

            {gameState === 'playing' && problem && (
                <div className="flex-1 w-full flex flex-col items-center justify-center space-y-12">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">Score: {score}</p>
                        <h2 className="text-6xl font-black text-foreground tabular-nums">{problem.text}</h2>
                    </div>

                    <div className="grid grid-cols-1 w-full gap-4">
                        {problem.options.map((opt, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                className="h-16 text-3xl font-light hover:bg-primary hover:text-primary-foreground transition-all"
                                onClick={() => handleAnswer(opt)}
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {gameState === 'gameover' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center animate-in zoom-in">
                    <h2 className="text-3xl font-bold">Time's Up!</h2>
                    <div className="text-6xl font-black text-primary">{score}</div>
                    <p className="text-muted-foreground">Problems solved</p>

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
