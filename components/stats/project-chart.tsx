"use client";

import { useStatsStore, useTaskStore } from "@/lib/store";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectDistributionChart() {
    const { sessions } = useStatsStore();
    const { projects, tasks } = useTaskStore();

    // Aggregate duration by project
    const data = projects.map(project => {
        // Find tasks belonging to this project
        const projectTaskIds = tasks.filter(t => t.projectId === project.id).map(t => t.id);

        // Calculate total duration for these tasks
        const duration = sessions
            .filter(s => s.taskId && projectTaskIds.includes(s.taskId))
            .reduce((acc, s) => acc + s.duration, 0);

        return {
            name: project.name,
            value: duration,
            color: project.color
        };
    }).filter(d => d.value > 0);

    return (
        <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
                <CardTitle>Focus by Project</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => [`${value} mins`, 'Duration']}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
                {data.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-[-150px] mb-[150px]">
                        No project data yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
