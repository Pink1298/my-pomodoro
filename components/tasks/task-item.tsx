"use client";

import { Task, Project } from "@/types";
import { useTaskStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, PlayCircle, Folder, ChevronDown, ChevronRight, Plus, Copy, Edit, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { TaskForm } from "./task-form";
import { format, isPast, isToday, isTomorrow } from "date-fns";

interface TaskItemProps {
    task: Task;
}

const PriorityColor = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    normal: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function TaskItem({ task }: TaskItemProps) {
    const { toggleTaskStatus, deleteTask, setActiveTask, activeTaskId, projects, addSubtask, toggleSubtask, deleteSubtask, addTask } = useTaskStore<any>(state => state);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newSubtask, setNewSubtask] = useState("");

    const isActive = activeTaskId === task.id;
    const project = projects.find((p: Project) => p.id === task.projectId);

    const getDueDateBadge = () => {
        if (!task.dueDate) return null;
        const date = new Date(task.dueDate);
        const isOverdue = isPast(date) && !isToday(date) && task.status !== 'done';
        let label = format(date, "MMM d");
        if (isToday(date)) label = "Today";
        else if (isTomorrow(date)) label = "Tomorrow";

        return (
            <Badge
                variant="outline"
                className={cn(
                    "h-5 px-1.5 gap-1 text-[10px] font-normal",
                    isOverdue ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900" : "text-muted-foreground"
                )}
            >
                <CalendarIcon className="h-3 w-3" />
                {label}
            </Badge>
        );
    };


    const handleToggle = () => {
        // Implement toggle logic if not already in store, or use updateTask
        const { updateTask } = useTaskStore.getState();
        updateTask(task.id, { status: task.status === "done" ? "todo" : "done" });
    };

    const handleDuplicate = () => {
        const { id, createdAt, ...taskData } = task;
        addTask({ ...taskData, title: `${task.title} (Copy)`, status: 'todo' });
    };

    const activeVariant = isActive
        ? "border-primary bg-primary/5 ring-1 ring-primary"
        : "hover:border-primary/50";

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        addSubtask(task.id, newSubtask);
        setNewSubtask("");
    }

    return (
        <>
            <TaskForm
                open={isEditing}
                onOpenChange={setIsEditing}
                taskToEdit={task}
            />
            <div
                className={cn(
                    "group relative rounded-lg border p-4 transition-all hover:shadow-sm",
                    activeVariant,
                    task.status === "done" && "opacity-60 bg-muted"
                )}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <button
                            onClick={handleToggle}
                            className={cn(
                                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                task.status === "done" && "bg-primary text-primary-foreground"
                            )}
                        >
                            {task.status === "done" && (
                                <svg
                                    width="10"
                                    height="8"
                                    viewBox="0 0 10 8"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M9 1L3.5 6.5L1 4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>

                        <div className="space-y-1 flex-1">
                            <div className="flex items-start justify-between">
                                <span className={cn("font-medium leading-none", task.status === "done" && "line-through text-muted-foreground")}>
                                    {task.title}
                                </span>
                            </div>

                            {(task.description || project || task.dueDate) && (
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    {getDueDateBadge()}
                                    {project && project.id !== 'default' && (
                                        <Badge variant="outline" className="h-5 px-1.5 gap-1 text-[10px] font-normal" style={{ borderColor: project.color, color: project.color }}>
                                            <Folder className="h-3 w-3" />
                                            {project.name}
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className={cn("h-5 px-1.5 text-[10px] uppercase font-normal", PriorityColor[task.priority])}>
                                        {task.priority}
                                    </Badge>
                                    {task.energyLevel && (
                                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900">
                                            {task.energyLevel === 'low' ? '⚡' : task.energyLevel === 'medium' ? '⚡⚡' : '⚡⚡⚡'}
                                        </Badge>
                                    )}
                                    {task.description && <p className="line-clamp-1 text-xs">{task.description}</p>}
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                    <span className="font-mono font-medium text-foreground">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                                    <span>pomodoros</span>
                                </div>
                                {task.subtasks && task.subtasks.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <span>•</span>
                                        <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                            </CollapsibleTrigger>
                        </Collapsible>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setActiveTask(task.id)}>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Set as Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDuplicate}>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleContent className="pt-4 pl-[36px] space-y-2">
                        {task.subtasks?.map(subtask => (
                            <div key={subtask.id} className="flex items-center justify-between group/sub">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={subtask.completed}
                                        onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                                    />
                                    <span className={cn("text-sm", subtask.completed && "line-through text-muted-foreground")}>
                                        {subtask.title}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover/sub:opacity-100"
                                    onClick={() => deleteSubtask(task.id, subtask.id)}
                                >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 pt-2">
                            <Input
                                placeholder="Add subtask..."
                                className="h-8 text-sm"
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                            />
                            <Button size="sm" variant="ghost" className="h-8" onClick={handleAddSubtask}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </>
    );
}
