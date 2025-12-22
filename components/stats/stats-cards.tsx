"use client";

import { useStatsStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Zap } from "lucide-react";

export function StatsCards() {
    const { sessions } = useStatsStore();

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
                    <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {totalHours}h {remainingMinutes}m
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Lifetime focus duration
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSessions}</div>
                    <p className="text-xs text-muted-foreground">
                        Total pomodoros finished
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" /> {/* Reuse icon or import Flame */}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{useStatsStore.getState().dailyStreak}</div>
                    <p className="text-xs text-muted-foreground">
                        Current streak
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
