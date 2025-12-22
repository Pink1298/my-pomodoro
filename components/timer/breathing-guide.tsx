"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/lib/store";

export function BreathingGuide() {
    const { isRunning, mode, focusMode } = useTimerStore();
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

    // Only show during Short/Long breaks if Focus Mode is ON
    const shouldShow = focusMode && (mode === 'shortBreak' || mode === 'longBreak') && isRunning;

    useEffect(() => {
        if (!shouldShow) return;

        let timeout: NodeJS.Timeout;

        const cycle = () => {
            setPhase('inhale');
            timeout = setTimeout(() => {
                setPhase('hold');
                timeout = setTimeout(() => {
                    setPhase('exhale');
                    timeout = setTimeout(() => {
                        cycle();
                    }, 6000); // Exhale 6s
                }, 4000); // Hold 4s
            }, 4000); // Inhale 4s
        };

        cycle();

        return () => clearTimeout(timeout);
    }, [shouldShow]);

    if (!shouldShow) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
            >
                <div className="relative flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : 1,
                        }}
                        transition={{
                            duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 0,
                            ease: "easeInOut"
                        }}
                        className="h-32 w-32 rounded-full bg-primary/20 blur-xl"
                    />
                    <motion.div
                        animate={{
                            scale: phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 1,
                        }}
                        transition={{
                            duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 0,
                            ease: "easeInOut"
                        }}
                        className="absolute h-24 w-24 rounded-full bg-primary/30"
                    />
                    <div className="absolute text-xl font-medium tracking-widest uppercase">
                        {phase}
                    </div>
                </div>
                <p className="mt-8 text-muted-foreground">Relax and breathe...</p>
            </motion.div>
        </AnimatePresence>
    );
}
