"use client";

import { useState } from "react";
import { useTaskStore } from "@/lib/store";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TaskCompletionChart() {
    const { tasks } = useTaskStore();
    const [metric, setMetric] = useState<"count" | "pomodoros">("count");

    // Last 30 days
    const data = Array.from({ length: 30 }).map((_, i) => {
        const date = subDays(new Date(), 29 - i);

        // Filter tasks finished on this day
        const completedTasks = tasks.filter(t =>
            t.status === 'done' &&
            t.completedAt &&
            isSameDay(new Date(t.completedAt), date)
        );

        const count = completedTasks.length;
        const pomodoros = completedTasks.reduce((acc, t) => acc + (t.completedPomodoros || 0), 0);

        return {
            name: format(date, "MMM dd"),
            value: metric === "count" ? count : pomodoros,
            fullDate: format(date, "MMM d, yyyy"),
            countLabel: metric === "count" ? "tasks" : "pomodoros",
        };
    });

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-normal">Task Completion Trend</CardTitle>
                <div className="w-[180px]">
                    <Select value={metric} onValueChange={(v: any) => setMetric(v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="count">Tasks Completed</SelectItem>
                            <SelectItem value="pomodoros">Pomodoros Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {payload[0].payload.fullDate}
                                                    </span>
                                                    <span className="font-bold">
                                                        {payload[0].value} {payload[0].payload.countLabel}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="hsl(var(--primary))"
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
