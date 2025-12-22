"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatsStore, useTaskStore } from "@/lib/store";
import { startOfWeek, endOfWeek, isWithinInterval, subWeeks } from "date-fns";
import { CheckCircle2, Timer, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function WeeklyReview() {
    const { sessions } = useStatsStore();
    const { tasks } = useTaskStore();

    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });
    const startOfLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const endOfLastWeek = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    // Calculate Pomodoros
    const currentWeekPomodoros = sessions.filter(session =>
        isWithinInterval(new Date(session.finishedAt), { start: startOfCurrentWeek, end: endOfCurrentWeek })
    ).length;

    const lastWeekPomodoros = sessions.filter(session =>
        isWithinInterval(new Date(session.finishedAt), { start: startOfLastWeek, end: endOfLastWeek })
    ).length;

    // Calculate Completed Tasks
    const currentWeekTasks = tasks.filter(task =>
        task.status === 'done' &&
        task.completedAt &&
        isWithinInterval(new Date(task.completedAt), { start: startOfCurrentWeek, end: endOfCurrentWeek })
    ).length;

    const lastWeekTasks = tasks.filter(task =>
        task.status === 'done' &&
        task.completedAt &&
        isWithinInterval(new Date(task.completedAt), { start: startOfLastWeek, end: endOfLastWeek })
    ).length;

    const getTrend = (current: number, last: number) => {
        if (last === 0) return current > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <Minus className="h-4 w-4 text-muted-foreground" />;
        const diff = current - last;
        if (diff > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (diff < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    return (
        <Card className="bg-gradient-to-br from-primary/5 via-primary/0 to-background border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    Weekly Snapshot
                    <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-muted border">
                        {startOfCurrentWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {endOfCurrentWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50 border shadow-sm">
                        <div className="flex items-center justify-between text-muted-foreground text-sm">
                            <span className="flex items-center gap-1.5"><Timer className="h-3.5 w-3.5" /> Pomodoros</span>
                            {getTrend(currentWeekPomodoros, lastWeekPomodoros)}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{currentWeekPomodoros}</span>
                            <span className="text-xs text-muted-foreground">vs {lastWeekPomodoros} last week</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50 border shadow-sm">
                        <div className="flex items-center justify-between text-muted-foreground text-sm">
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Tasks Done</span>
                            {getTrend(currentWeekTasks, lastWeekTasks)}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{currentWeekTasks}</span>
                            <span className="text-xs text-muted-foreground">vs {lastWeekTasks} last week</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
