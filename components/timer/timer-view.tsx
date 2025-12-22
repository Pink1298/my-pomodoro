"use client";

import { usePomodoroTimer } from "@/hooks/use-pomodoro-timer";
import { useTimerStore, useTaskStore } from "@/lib/store";
import { TimerCircle } from "./timer-circle";
import { TimerControls } from "./timer-controls";
import { WhiteNoisePlayer } from "./white-noise-player";
import { BreathingGuide } from "./breathing-guide";
import { DailyFocus } from "@/components/habits/daily-focus";
import { SmartGreeting } from "./smart-greeting";
import { VisualQuote } from "@/components/motivation/visual-quote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Maximize2, Minimize2, Play, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday } from "date-fns";
import { motion } from "framer-motion";

export function TimerView() {
    const { timeLeft, isRunning, mode, toggleTimer, resetTimer } = usePomodoroTimer();
    const { settings, focusMode, setFocusMode } = useTimerStore();
    const { activeTaskId, tasks, setActiveTask } = useTaskStore();

    const activeTask = tasks.find(t => t.id === activeTaskId);
    const todayTasks = tasks.filter(t =>
        t.status !== 'done' &&
        (t.dueDate ? isToday(new Date(t.dueDate)) : true)
    ).sort((a, b) => {
        const pWeight = { high: 3, normal: 2, low: 1 };
        return (pWeight[b.priority] || 0) - (pWeight[a.priority] || 0);
    });

    const totalTime =
        mode === "pomodoro"
            ? settings.pomodoroDuration * 60
            : mode === "shortBreak"
                ? settings.shortBreakDuration * 60
                : settings.longBreakDuration * 60;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

    return (
        <div className={cn("relative transition-all duration-700 w-full h-full flex justify-center p-4 lg:p-12")}>
            <BreathingGuide />

            <div className={cn("grid w-full transition-all duration-700 gap-12 lg:gap-24", focusMode ? "grid-cols-1" : "lg:grid-cols-2 max-w-6xl")}>

                {/* TIMER SECTION (LEFT) */}
                <div className={cn("flex flex-col align-center justify-center space-y-10 transition-all duration-500",
                    focusMode && "scale-110"
                )}>
                    {/* Header */}
                    <div className={cn("text-center space-y-4 transition-all duration-500", focusMode && isRunning ? "opacity-0 scale-95 h-0 overflow-hidden" : "opacity-100")}>
                        {!focusMode && <SmartGreeting />}
                        <motion.div layoutId="timer-status" className="space-y-2">
                            <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                                {mode === 'pomodoro' ? 'Focus' : 'Breathe'}
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                {mode === 'pomodoro' ? 'One thing at a time' : 'Recharge your mind'}
                            </p>
                        </motion.div>
                        <div className="h-8 flex justify-center">
                            {activeTask && mode === 'pomodoro' && (
                                <Badge variant="secondary" className="text-sm py-1.5 px-4 rounded-full">
                                    Working on: {activeTask.title}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <TimerCircle timeLeft={timeLeft} totalTime={totalTime} mode={mode}>
                        <div className="flex flex-col items-center">
                            <div className="text-7xl lg:text-7xl font-bold font-mono tracking-tighter tabular-nums text-foreground select-none">
                                {formattedTime}
                            </div>
                        </div>
                    </TimerCircle>

                    <div className="flex flex-col items-center gap-8 w-full  z-10">
                        <TimerControls
                            isRunning={isRunning}
                            onToggle={toggleTimer}
                            onReset={resetTimer}
                            showSkip={mode !== 'pomodoro'}
                            onSkip={() => useTimerStore.getState().setMode('pomodoro')}
                        />

                        {!focusMode && (
                            <div className="w-full space-y-6 flex flex-col items-center">
                                <WhiteNoisePlayer />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    onClick={() => setFocusMode(!focusMode)}
                                >
                                    <Maximize2 className="h-3 w-3 mr-2" />
                                    Enter Focus Mode
                                </Button>
                            </div>
                        )}

                        {focusMode && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="rounded-full text-xs"
                                onClick={() => setFocusMode(!focusMode)}
                            >
                                <Minimize2 className="h-3 w-3 mr-2" />
                                Exit Focus Mode
                            </Button>
                        )}
                    </div>
                    <VisualQuote />

                </div>

                {/* TASKS SECTION (RIGHT) */}
                {!focusMode && (
                    <div className="hidden lg:flex flex-col gap-6 h-[600px] animate-in slide-in-from-right-8 fade-in duration-700">
                        <DailyFocus />

                        <div className="flex-1 flex flex-col space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-border/40">
                                <h3 className="text-xl font-semibold tracking-tight">Today's Focus</h3>
                                <Badge variant="outline" className="font-normal text-muted-foreground">{todayTasks.length} tasks</Badge>
                            </div>

                            <ScrollArea className="flex-1 -mr-4 pr-4">
                                <div className="space-y-4">
                                    {todayTasks.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 py-20 gap-4">
                                            <CheckCircle2 className="h-12 w-12 opacity-20" />
                                            <p className="font-medium">All clear for today</p>
                                        </div>
                                    ) : (
                                        todayTasks.map(task => (
                                            <motion.div
                                                layoutId={task.id}
                                                key={task.id}
                                                onClick={() => setActiveTask(task.id)}
                                                className={cn(
                                                    "group flex items-center p-3 rounded-lg transition-all cursor-pointer",
                                                    activeTaskId === task.id ? "bg-primary/5" : "hover:bg-muted/40"
                                                )}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-base font-medium truncate", activeTaskId === task.id && "text-primary")}>
                                                        {task.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mt-1">
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            task.priority === 'high' ? "bg-red-400" :
                                                                task.priority === 'normal' ? "bg-blue-400" :
                                                                    "bg-slate-400"
                                                        )} />
                                                        <span className="capitalize">{task.priority}</span>
                                                        <span>•</span>
                                                        <span>{task.completedPomodoros}/{task.estimatedPomodoros} pomos</span>
                                                    </div>
                                                </div>

                                                {activeTaskId === task.id ? (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        <Badge variant="default" className="ml-2 h-6 w-6 p-0 flex items-center justify-center rounded-full shadow-sm">
                                                            <Play className="h-3 w-3 fill-current ml-0.5" />
                                                        </Badge>
                                                    </motion.div>
                                                ) : (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="ml-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <Play className="h-4 w-4 fill-current ml-0.5" />
                                                    </Button>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
