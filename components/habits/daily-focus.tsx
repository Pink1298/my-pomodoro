"use client";

import { useState, useEffect } from "react";
import { useStatsStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PenLine } from "lucide-react";

export function DailyFocus() {
    const { currentDailyIntention, setDailyIntention, journal } = useStatsStore();
    const [input, setInput] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Check if we have an intention for today in the journal vs store state sync
        // The store logic already handles sync but on load we might want to check data
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = journal.find(j => j.date === today);
        if (todayEntry) {
            setInput(todayEntry.intention);
        } else if (currentDailyIntention) {
            // Maybe explicitly clear if day changed? For now trust store.
            setInput(currentDailyIntention);
        }
    }, [currentDailyIntention, journal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            setDailyIntention(input.trim());
            setIsEditing(false);
        }
    };

    // Check if day changed relative to stored intention? 
    // Simplified: Store handles "current" but arguably creates stale data if app stays open overnight.
    // For MVP, we trust the component mount logic.

    if (!isClient) return null;

    const today = new Date().toISOString().split('T')[0];
    const hasIntention = journal.some(j => j.date === today && j.intention);

    if (hasIntention && !isEditing) {
        return (
            <div className="flex flex-col items-center space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Daily Focus</p>
                <div className="flex items-center space-x-2 group">
                    <h3 className="text-xl font-medium text-foreground text-center">
                        &quot;{input}&quot;
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setIsEditing(true)}
                    >
                        <PenLine className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-500">
            <form onSubmit={handleSubmit} className="relative">
                <Input
                    placeholder="What is your main focus for today?"
                    className="text-center h-12 text-lg bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all font-light"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus={false}
                />
                {input.trim() && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1.5 h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                        type="submit"
                    >
                        <CheckCircle2 className="h-5 w-5" />
                    </Button>
                )}
            </form>
        </div>
    );
}
