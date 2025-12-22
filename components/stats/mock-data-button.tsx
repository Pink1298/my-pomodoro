"use client";

import { Button } from "@/components/ui/button";
import { useStatsStore, useTaskStore } from "@/lib/store";
import { Project, Session, Task } from "@/types";
import { subDays, startOfDay, addMinutes, setHours, setMinutes } from "date-fns";
import { RefreshCw } from "lucide-react";

export function MockDataButton() {
    const { addSession, resetState: resetStats } = useStatsStore();
    const { setTasks, setProjects, addProject, resetState: resetTasks } = useTaskStore();

    const generateData = () => {
        // Reset first
        resetStats();
        resetTasks();

        // 1. Projects
        const projects: Project[] = [
            { id: 'p1', name: 'Deep Work', color: '#3b82f6' }, // Blue
            { id: 'p2', name: 'Learning', color: '#10b981' }, // Green
            { id: 'p3', name: 'Admin', color: '#78716c' }, // Stone
        ];
        // We can't easily bulk set projects with ids in useTaskStore without a bulk setter or looping.
        // The store has `setProjects`.
        setProjects(projects);

        // 2. Tasks (Historical Completion)
        const tasks: Task[] = [];
        const now = new Date();

        // Generate 30 completed tasks over the last 30 days
        for (let i = 0; i < 30; i++) {
            const date = subDays(now, Math.floor(Math.random() * 30));
            // Random due date: some past, some future relative to completion
            const dueDate = Math.random() > 0.3
                ? addMinutes(date, Math.floor(Math.random() * 5000)).getTime()
                : undefined;

            tasks.push({
                id: crypto.randomUUID(),
                title: `Task ${i + 1}`,
                status: 'done',
                completedAt: date.getTime(),
                completedPomodoros: Math.floor(Math.random() * 4) + 1,
                estimatedPomodoros: 4,
                createdAt: subDays(date, 2).getTime(),
                priority: 'normal',
                projectId: projects[Math.floor(Math.random() * projects.length)].id,
                dueDate: dueDate,
                subtasks: [],
            });
        }

        // Add some todo tasks
        for (let i = 0; i < 8; i++) {
            const isToday = Math.random() > 0.7;
            const isTomorrow = Math.random() > 0.8;
            let dueDate: number | undefined;

            if (isToday) dueDate = now.getTime();
            else if (isTomorrow) dueDate = addMinutes(now, 24 * 60).getTime();
            else if (Math.random() > 0.5) dueDate = addMinutes(now, Math.floor(Math.random() * 10000)).getTime();

            tasks.push({
                id: crypto.randomUUID(),
                title: `Active Task ${i + 1}`,
                status: 'todo',
                completedPomodoros: 0,
                estimatedPomodoros: Math.floor(Math.random() * 4) + 1,
                createdAt: now.getTime(),
                priority: Math.random() > 0.7 ? 'high' : (Math.random() > 0.4 ? 'normal' : 'low'),
                energyLevel: Math.random() > 0.6 ? 'high' : (Math.random() > 0.3 ? 'medium' : 'low'),
                projectId: projects[Math.floor(Math.random() * projects.length)].id,
                dueDate: dueDate,
                subtasks: [],
            });
        }

        setTasks(tasks);

        // 3. Sessions (Focus Distribution)
        // Generate 50 sessions in last 7 days
        for (let i = 0; i < 50; i++) {
            const dayOffset = Math.floor(Math.random() * 7); // 0-6 days ago
            const date = subDays(now, dayOffset);

            // Random hour between 8am (8) and 10pm (22)
            const hour = Math.floor(Math.random() * (22 - 8 + 1)) + 8;
            const minute = Math.floor(Math.random() * 60);

            const finishedAt = setMinutes(setHours(date, hour), minute);
            const duration = [25, 25, 25, 50, 15][Math.floor(Math.random() * 5)]; // Weighted towards 25

            const project = projects[Math.floor(Math.random() * projects.length)];

            const session: Omit<Session, 'id'> = {
                duration: duration,
                finishedAt: finishedAt.getTime(),
                projectId: project.id,
                taskId: undefined // Optional linkage
            };
            addSession(session);
        }

        alert("Mock data generated! 📊");
    };

    return (
        <Button variant="outline" size="sm" onClick={generateData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Demo Data
        </Button>
    );
}
