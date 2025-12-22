"use client";

import { useEffect, useState } from "react";
import { useTaskStore, useTimerStore } from "@/lib/store";
import { Sparkles } from "lucide-react";

export function SmartGreeting() {
    const { tasks } = useTaskStore();
    const { mode } = useTimerStore();
    const [greeting, setGreeting] = useState("");
    const [suggestion, setSuggestion] = useState("");

    useEffect(() => {
        const hour = new Date().getHours();
        let timeGreeting = "Good morning";
        if (hour >= 12 && hour < 17) timeGreeting = "Good afternoon";
        if (hour >= 17) timeGreeting = "Good evening";

        setGreeting(timeGreeting);

        // Smart Suggestion Logic
        // Morning (6-11): High energy tasks
        // Afternoon (12-16): Medium energy tasks
        // Evening (17+): Low energy / Review

        const pendingTasks = tasks.filter(t => t.status !== 'done');
        let suggestedTask = null;

        if (hour < 12) {
            suggestedTask = pendingTasks.find(t => t.energyLevel === 'high' || t.priority === 'high');
            if (suggestedTask) setSuggestion(`Great time for high-focus work like "${suggestedTask.title}".`);
            else setSuggestion("Ready to tackle your most important task?");
        } else if (hour < 17) {
            suggestedTask = pendingTasks.find(t => t.energyLevel === 'medium');
            if (suggestedTask) setSuggestion(`Steady pace. How about working on "${suggestedTask.title}"?`);
            else setSuggestion("Keep the momentum going.");
        } else {
            suggestedTask = pendingTasks.find(t => t.energyLevel === 'low');
            if (suggestedTask) setSuggestion(`Wind down with lighter tasks like "${suggestedTask.title}".`);
            else setSuggestion("Time to wrap up or review your day.");
        }

    }, [tasks, mode]);

    if (mode !== 'pomodoro') return null;

    return (
        <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
            <h2 className="text-2xl font-light mb-1">{greeting}</h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Sparkles className="h-3 w-3 text-yellow-500" />
                <p>{suggestion}</p>
            </div>
        </div>
    );
}
