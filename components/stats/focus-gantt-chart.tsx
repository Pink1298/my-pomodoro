"use client";

import { useStatsStore, useTaskStore } from "@/lib/store";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, Legend } from "recharts";
import { format, getHours, getMinutes } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FocusGanttChart() {
    const { sessions } = useStatsStore();
    const { projects } = useTaskStore();

    // Filter sessions from the last 7 days? Or just today? 
    // Usually Gantt is best for "Daily Timeline" or "Weekly Overview".
    // Let's do a "Time of Day" distribution scatter plot.
    // X Axis: Time of Day (0-24h)
    // Y Axis: Date (Last 7 days)
    // Size/Color: Duration / Project

    // Prepare Data
    const data = sessions
        //.filter(s => new Date(s.finishedAt) > subDays(new Date(), 7)) // Last 7 days
        .map(session => {
            const date = new Date(session.finishedAt); // This is end time. Start time = end - duration.
            // Start time calculation
            const endTime = date.getTime();
            const startTime = endTime - (session.duration * 60 * 1000);
            const startDate = new Date(startTime);

            const project = projects.find(p => p.id === session.projectId || p.name === session.projectId); // Handle legacy string IDs if any

            return {
                x: getHours(startDate) + (getMinutes(startDate) / 60), // Decimal hour (e.g., 14.5 = 2:30 PM)
                y: format(startDate, "MMM dd"), // Date string for Y-axis category
                z: session.duration, // Bubble size
                name: project?.name || 'Unknown',
                color: project?.color || '#888888',
                startTime: format(startDate, "HH:mm"),
                endTime: format(date, "HH:mm")
            };
        }).sort((a, b) => new Date(a.y).getTime() - new Date(b.y).getTime()).slice(-50); // Limit to recent 50 sessions for clarity or filter by date range

    // Group by Project for Legend? ScatterChart handles this if we use different Series, 
    // but simplified approach is single series with custom cells.

    return (
        <Card className="col-span-4 lg:col-span-4">
            <CardHeader>
                <CardTitle>Focus Timeline (Distribution)</CardTitle>
                <p className="text-sm text-muted-foreground">See when you are most productive throughout the day.</p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart
                        margin={{
                            top: 20,
                            right: 20,
                            bottom: 20,
                            left: 20,
                        }}
                    >
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="Hour"
                            unit="h"
                            domain={[0, 24]}
                            tickCount={13}
                            tickFormatter={(unixTime) => `${unixTime}:00`}
                        />
                        <YAxis type="category" dataKey="y" name="Date" allowDuplicatedCategory={false} />
                        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Duration" unit="mins" />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <p className="font-bold" style={{ color: data.color }}>{data.name}</p>
                                            <p className="text-sm">Date: {data.y}</p>
                                            <p className="text-sm">Time: {data.startTime} - {data.endTime}</p>
                                            <p className="text-sm">Duration: {data.z} mins</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter name="Sessions" data={data} fill="#8884d8">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
