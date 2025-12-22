"use client";

import { useTaskStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CheckCircle2, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RecentActivity() {
    const { tasks, projects } = useTaskStore();

    // Get completed tasks, sorted by completion date (most recent first)
    const completedTasks = tasks
        .filter(t => t.status === 'done' && t.completedAt)
        .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
        .slice(0, 10); // Show top 10

    const getProjectColor = (projectId?: string) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.color : '#64748b'; // Default slate
    };

    const getProjectName = (projectId?: string) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : 'Inbox';
    };

    return (
        <Card className="col-span-full">
            <CardHeader className="pb-3">
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Your recently completed tasks and focus effort.
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {completedTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No completed tasks yet.</p>
                    ) : (
                        completedTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span className="font-medium line-through decoration-muted-foreground/50">{task.title}</span>
                                        <Badge variant="outline" className="text-xs" style={{ borderColor: getProjectColor(task.projectId), color: getProjectColor(task.projectId) }}>
                                            {getProjectName(task.projectId)}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground pl-6">
                                        Completed on {format(task.completedAt!, "MMM d, h:mm a")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 font-mono text-sm">
                                            <Timer className="h-3 w-3 text-muted-foreground" />
                                            <span>
                                                <span className="font-bold">{task.completedPomodoros}</span>
                                                <span className="text-muted-foreground"> / {task.estimatedPomodoros}</span>
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">pomodoros</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
