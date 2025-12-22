"use client";

import { useStatsStore } from "@/lib/store";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { subDays, format, startOfDay, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DailyChart() {
    const { sessions } = useStatsStore();

    const data = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), 6 - i);
        const daySessions = sessions.filter((s) =>
            isSameDay(new Date(s.finishedAt), date)
        );

        // Calculate total minutes for the day
        const minutes = daySessions.reduce((acc, s) => acc + s.duration, 0);

        return {
            name: format(date, "EEE"), // Mon, Tue, etc.
            minutes: minutes,
            fullDate: format(date, "MMM d, yyyy"),
        };
    });

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Focus Activity (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}m`}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {payload[0].payload.fullDate}
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {payload[0].value} mins
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="minutes"
                            fill="currentColor"
                            className="fill-primary"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
