"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useScheduleStore, useTaskStore } from "@/lib/store";
import { format, isSameDay, addDays, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export function ScheduleView() {
    const { blocks, addBlock, removeBlock } = useScheduleStore();
    const { tasks } = useTaskStore();

    const [date, setDate] = useState<Date>(new Date());
    const [newTime, setNewTime] = useState("");
    const [newActivity, setNewActivity] = useState("");
    const [selectedTaskId, setSelectedTaskId] = useState<string>("custom");

    // Filter blocks for the selected date
    const dailyBlocks = blocks.filter(block =>
        block.date === format(date, 'yyyy-MM-dd') || (!block.date && isSameDay(date, new Date())) // Handle legacy blocks as today for now
    );

    // Filter tasks due on selected date
    const tasksForDate = tasks.filter(t =>
        t.dueDate && isSameDay(new Date(t.dueDate), date)
    );

    const handleAddBlock = () => {
        if (!newTime) return;

        let activityName = newActivity;
        let taskId: string | undefined = undefined;

        if (selectedTaskId !== "custom") {
            const task = tasks.find(t => t.id === selectedTaskId);
            if (task) {
                activityName = task.title;
                taskId = task.id;
            }
        }

        if (!activityName) return;

        addBlock({
            date: format(date, 'yyyy-MM-dd'),
            startTime: newTime,
            activity: activityName,
            taskId,
        });

        setNewTime("");
        setNewActivity("");
        setSelectedTaskId("custom");
    };

    const handleAddTaskToSchedule = (task: any) => {
        // Default to next hour or something? For now just fill the form
        setNewActivity(task.title);
        setSelectedTaskId(task.id);
        // Focus time input?
        const now = new Date();
        const nextHour = new Date(now.setHours(now.getHours() + 1, 0, 0, 0));
        setNewTime(format(nextHour, 'HH:mm'));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Daily Plan</h2>
                    <p className="text-muted-foreground">Block time for what matters.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setDate(subDays(date, 1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Input
                        type="date"
                        className="w-[160px]"
                        value={date ? format(date, 'yyyy-MM-dd') : ''}
                        onChange={(e) => e.target.value && setDate(new Date(e.target.value))}
                    />

                    <Button variant="outline" size="icon" onClick={() => setDate(addDays(date, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Schedule Column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Add Block Form */}
                    <Card className="border-dashed">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-medium text-muted-foreground">Add to Schedule</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Input
                                        type="time"
                                        className="w-full sm:w-32"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                    />

                                    <div className="flex-1 flex gap-2">
                                        {selectedTaskId === 'custom' ? (
                                            <Input
                                                placeholder="Activity description..."
                                                className="flex-1"
                                                value={newActivity}
                                                onChange={(e) => setNewActivity(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddBlock()}
                                            />
                                        ) : (
                                            <div className="flex-1 flex items-center px-3 border rounded-md bg-muted/50 text-sm">
                                                Task: {tasks.find(t => t.id === selectedTaskId)?.title}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-auto h-6 w-6 p-0"
                                                    onClick={() => { setSelectedTaskId('custom'); setNewActivity(''); }}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}

                                        <Button onClick={handleAddBlock}>
                                            <Plus className="h-4 w-4 mr-2" /> Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-2">
                        {dailyBlocks.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No plans for {format(date, 'MMMM do')}.</p>
                            </div>
                        ) : (
                            dailyBlocks.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((block) => (
                                <Card key={block.id} className="hover:shadow-sm transition-shadow">
                                    <CardContent className="p-3 flex items-center gap-4">
                                        <div className="flex items-center gap-2 min-w-[5rem] text-sm font-mono text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {block.startTime}
                                        </div>

                                        <div className="h-8 w-1 bg-primary/20 rounded-full" />

                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{block.activity}</p>
                                        </div>

                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeBlock(block.id)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar: Tasks for the day */}
                <div className="space-y-4">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="p-4 border-b bg-muted/20">
                            <h3 className="font-semibold">Available Tasks</h3>
                            <p className="text-xs text-muted-foreground">For {format(date, 'MMM d')}</p>
                        </div>
                        <div className="p-2 space-y-2">
                            {tasksForDate.length === 0 ? (
                                <p className="text-xs text-center p-4 text-muted-foreground">No tasks due this day.</p>
                            ) : (
                                tasksForDate.map(task => (
                                    <div
                                        key={task.id}
                                        className="p-3 border rounded bg-background hover:bg-accent/50 cursor-pointer text-sm group flex justify-between items-center"
                                        onClick={() => handleAddTaskToSchedule(task)}
                                    >
                                        <span className="line-clamp-1 font-medium">{task.title}</span>
                                        <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary" />
                                    </div>
                                ))
                            )}

                            {/* Option to show all tasks */}
                            <div className="pt-2 border-t mt-2">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground px-2 mb-2">Backlog</p>
                                <div className="max-h-[300px] overflow-y-auto space-y-2">
                                    {tasks.filter(t => t.status !== 'done' && (!t.dueDate || !isSameDay(new Date(t.dueDate), date))).map(task => (
                                        <div
                                            key={task.id}
                                            className="p-2 border rounded bg-background hover:bg-accent/50 cursor-pointer text-xs flex justify-between items-center"
                                            onClick={() => handleAddTaskToSchedule(task)}
                                        >
                                            <span className="line-clamp-1">{task.title}</span>
                                            <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
