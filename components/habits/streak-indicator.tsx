"use client";

import { useEffect, useState } from "react";
import { useStatsStore } from "@/lib/store";
import { Flame, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function StreakIndicator() {
    const { dailyStreak, lastFocusDate } = useStatsStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || dailyStreak === 0) return null;

    const isActiveToday = lastFocusDate === new Date().toISOString().split('T')[0];

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-help",
                        isActiveToday
                            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-muted text-muted-foreground"
                    )}>
                        {dailyStreak > 3 ? (
                            <Flame className={cn("h-4 w-4", isActiveToday && "fill-current animate-pulse")} />
                        ) : (
                            <Leaf className={cn("h-4 w-4", isActiveToday && "fill-current")} />
                        )}
                        <span>{dailyStreak}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{dailyStreak} day{dailyStreak !== 1 ? 's' : ''} focus streak!</p>
                    {!isActiveToday && <p className="text-xs text-muted-foreground">Focus today to keep it.</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
