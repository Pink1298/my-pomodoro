"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TimerMode } from "@/types";

interface TimerCircleProps {
    timeLeft: number;
    totalTime: number;
    mode: TimerMode;
    children?: React.ReactNode;
}

export function TimerCircle({ timeLeft, totalTime, mode, children }: TimerCircleProps) {
    const radius = 120;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Background Circle */}
                </div>

                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={4}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="text-[#E0E0DC] dark:text-stone-800" // Light warm gray for track
                />
                {/* Progress Circle */}
                <motion.circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={4}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={cn(
                        "transition-all duration-1000 ease-linear text-primary",
                        mode !== 'pomodoro' && "opacity-80"
                    )}
                    style={{
                        strokeDasharray: `${circumference} ${circumference}`,
                        strokeDashoffset,
                        filter: "drop-shadow(0px 0px 4px hsl(var(--primary) / 0.3))" // Soft glow using theme color
                    }}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                />
            </svg>
            {/* Content inside circle */}
            <div className="absolute inset-0 flex items-center justify-center flex-col">
                {children}
            </div>
        </div>
    );
}
