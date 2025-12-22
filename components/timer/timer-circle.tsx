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
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="text-muted-foreground/20"
                />
                {/* Progress Circle */}
                <motion.circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={cn(
                        "transition-all duration-1000 ease-linear text-primary"
                    )}
                    style={{
                        strokeDasharray: `${circumference} ${circumference}`,
                        strokeDashoffset,
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
