"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, RefreshCw, SkipForward } from "lucide-react";

interface TimerControlsProps {
    isRunning: boolean;
    onToggle: () => void;
    onReset: () => void;
    onSkip?: () => void;
    showSkip?: boolean;
}

export function TimerControls({ isRunning, onToggle, onReset, onSkip, showSkip }: TimerControlsProps) {
    return (
        <div className="flex items-center space-x-4">
            <Button
                size="lg"
                className="h-16 w-16 rounded-full text-xl"
                onClick={onToggle}
            >
                {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
            </Button>
            <Button variant="outline" size="icon" onClick={onReset} className="rounded-full" title="Reset Timer">
                <RefreshCw className="h-5 w-5" />
            </Button>
            {showSkip && (
                <Button variant="outline" size="icon" onClick={onSkip} className="rounded-full" title="Skip Break">
                    <SkipForward className="h-5 w-5" />
                </Button>
            )}
        </div>
    );
}
