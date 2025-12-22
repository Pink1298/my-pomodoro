'use client';

import { useState } from "react";
import { ArrowUpDown, Calendar as CalendarIcon, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useTaskStore } from "@/lib/store";
import { ProjectManager } from "./project-manager";
import { TaskForm } from "./task-form";
import { TaskItem } from "./task-item";
import { format, isSameDay, isToday, isTomorrow, isThisWeek } from "date-fns";
import { cn } from "@/lib/utils";

export function TaskList() {
    const { tasks } = useTaskStore();
    const [sortBy, setSortBy] = useState<"createdAt" | "priority" | "energyLevel">("createdAt");
    const [filterType, setFilterType] = useState<"all" | "today" | "tomorrow" | "week" | "custom">("all");
    const [customDate, setCustomDate] = useState<Date | undefined>(undefined);

    const getFilteredTasks = () => {
        let filtered = tasks;

        if (filterType === 'today') {
            filtered = tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)));
        } else if (filterType === 'tomorrow') {
            filtered = tasks.filter(t => t.dueDate && isTomorrow(new Date(t.dueDate)));
        } else if (filterType === 'week') {
            filtered = tasks.filter(t => t.dueDate && isThisWeek(new Date(t.dueDate)));
        } else if (filterType === 'custom' && customDate) {
            filtered = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), customDate));
        }

        return filtered;
    };

    const sortTasks = (tasks: any[]) => {
        return [...tasks].sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityWeight: any = { high: 3, normal: 2, low: 1 };
                return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
            }
            if (sortBy === 'energyLevel') {
                const energyWeight = { high: 3, medium: 2, low: 1 };
                const wA = a.energyLevel ? energyWeight[a.energyLevel as keyof typeof energyWeight] : 2; // medium default
                const wB = b.energyLevel ? energyWeight[b.energyLevel as keyof typeof energyWeight] : 2;
                return wB - wA;
            }
            // Default: createdAt
            return b.createdAt - a.createdAt;
        });
    };

    const filteredTasks = getFilteredTasks();
    const sortedTasks = sortTasks(filteredTasks);
    const todoTasks = sortedTasks.filter((t) => t.status !== "done");
    const doneTasks = sortedTasks.filter((t) => t.status === "done");

    const clearFilters = () => {
        setFilterType('all');
        setCustomDate(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
                    <p className="text-muted-foreground">Manage your focus sessions.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Filter Select */}
                    <Select
                        value={filterType}
                        onValueChange={(v: any) => {
                            setFilterType(v);
                            if (v !== 'custom') setCustomDate(undefined);
                        }}
                    >
                        <SelectTrigger className={cn("w-[140px] h-9", filterType !== 'all' && "border-primary text-primary bg-primary/5")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="custom">Pick Date...</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Custom Date Picker */}
                    {filterType === 'custom' && (
                        <Input
                            type="date"
                            className={cn(
                                "h-9 w-auto",
                                customDate && "border-primary text-primary bg-primary/5"
                            )}
                            value={customDate ? format(customDate, 'yyyy-MM-dd') : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                    setCustomDate(new Date(val));
                                } else {
                                    setCustomDate(undefined);
                                }
                            }}
                        />
                    )}

                    {(filterType !== 'all' || customDate) && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} className="h-9 w-9" title="Clear Filters">
                            <X className="h-4 w-4" />
                        </Button>
                    )}

                    <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                        <SelectTrigger className="w-[130px] h-9">
                            <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">Newest</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                            <SelectItem value="energyLevel">Energy</SelectItem>
                        </SelectContent>
                    </Select>

                    <ProjectManager />
                    <TaskForm />
                </div>
            </div>

            <div className="space-y-4">
                {todoTasks.length === 0 && doneTasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                        <p>
                            {filterType !== 'all'
                                ? "No tasks found for this period."
                                : "No tasks yet. Add one to get started!"}
                        </p>
                        {filterType !== 'all' && (
                            <Button variant="link" onClick={clearFilters} className="mt-2">
                                Clear filters
                            </Button>
                        )}
                    </div>
                )}

                {todoTasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                ))}

                {doneTasks.length > 0 && (
                    <>
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Completed</span>
                            </div>
                        </div>
                        <div className="space-y-4 opacity-75">
                            {doneTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
