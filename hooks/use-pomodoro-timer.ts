"use client";

import { useEffect, useRef } from "react";
import { useTimerStore, useTaskStore, useStatsStore } from "@/lib/store";
import { toast } from "sonner";

export function usePomodoroTimer() {
    const {
        timeLeft,
        isRunning,
        mode,
        settings,
        setTimeLeft,
        setIsRunning,
        setMode,
        resetTimer,
    } = useTimerStore();

    const { activeTaskId, incrementTaskPomodoro } = useTaskStore();
    const { addSession } = useStatsStore();

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleComplete();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, timeLeft]);

    const handleComplete = () => {
        setIsRunning(false);
        playNotificationSound();

        let nextMode: import("@/types").TimerMode = mode;
        if (mode === "pomodoro") {
            // Completed a focus session
            toast.success("Focus session completed!");

            // Log session
            addSession({
                duration: settings.pomodoroDuration,
                finishedAt: Date.now(),
                taskId: activeTaskId || undefined
            });

            if (activeTaskId) {
                incrementTaskPomodoro(activeTaskId);

                // Check for auto-completion
                const { tasks, updateTask } = useTaskStore.getState();
                const updatedTask = tasks.find(t => t.id === activeTaskId);

                if (updatedTask &&
                    updatedTask.estimatedPomodoros > 0 &&
                    updatedTask.completedPomodoros >= updatedTask.estimatedPomodoros &&
                    updatedTask.status !== 'done'
                ) {
                    updateTask(activeTaskId, { status: 'done' });
                    toast.success("Goal reached! Task completed. 🎉");
                }
            }

            // Basic auto-switch logic
            nextMode = "shortBreak";
        } else {
            toast.info("Break is over! Time to focus.");
            nextMode = "pomodoro";
        }

        // Web Notification
        if (Notification.permission === "granted") {
            new Notification(mode === 'pomodoro' ? "Focus Session Complete" : "Break Over", {
                body: mode === 'pomodoro' ? "Great job! Take a break." : "Time to get back to work!",
                icon: "/favicon.ico"
            });
        }

        setMode(nextMode);

        // Auto-start logic
        if (
            settings.continuousMode ||
            (nextMode === "pomodoro" && settings.autoStartPomodoros) ||
            (nextMode !== "pomodoro" && settings.autoStartBreaks)
        ) {
            setIsRunning(true);
        }
    };

    const playNotificationSound = () => {
        // Simple Web Audio API soft chime
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

        osc.start();
        osc.stop(ctx.currentTime + 1);
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    return {
        timeLeft,
        isRunning,
        mode,
        toggleTimer,
        resetTimer,
    };
}
