"use client";

import { usePomodoroTimer } from "@/hooks/use-pomodoro-timer";
import { useTimerStore, useTaskStore } from "@/lib/store";
import { TimerCircle } from "./timer-circle";
import { TimerControls } from "./timer-controls";
import { WhiteNoisePlayer } from "./white-noise-player";
import { YouTubePlayer } from "./youtube-player";
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
import { useState } from "react";

export function TimerView() {
    const { timeLeft, isRunning, mode, toggleTimer, resetTimer } = usePomodoroTimer();
    const { settings, focusMode, setFocusMode } = useTimerStore();
    const { activeTaskId, tasks, setActiveTask } = useTaskStore();
    const [audioMode, setAudioMode] = useState<'noise' | 'youtube'>('noise');

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
        <div className="w-full min-h-[calc(100vh-4rem)] bg-[#FDFCF8] dark:bg-stone-950 text-[#4A4744] dark:text-stone-400 flex items-center justify-center p-4 lg:p-8">
            <BreathingGuide />

            <div className={cn(
                "w-full transition-all duration-700",
                focusMode
                    ? "flex justify-center"
                    : "grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
            )}>

                {/* --- LEFT COLUMN: TIMER & AUDIO --- */}
                <div className={cn(
                    "flex flex-col gap-8 transition-all duration-500 order-1",
                    focusMode ? "lg:w-auto scale-110" : "lg:col-span-7 justify-between"
                )}>

                    {/* Timer Card */}
                    <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[3rem] bg-white dark:bg-stone-900 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#F0EFEB] dark:border-stone-800">
                        <div className={cn("text-center space-y-2 mb-8 transition-all duration-500", focusMode && isRunning ? "opacity-0 h-0 overflow-hidden" : "opacity-100")}>
                            {!focusMode && <SmartGreeting />}
                            <motion.div layoutId="timer-status" className="space-y-1">
                                <h1 className="text-3xl font-light tracking-wide text-[#2D2A26] dark:text-stone-200">
                                    {mode === 'pomodoro' ? 'Focus Session' : 'Rest & Recharge'}
                                </h1>
                                <p className="text-[#8C8884] dark:text-stone-500 text-sm font-light">
                                    {mode === 'pomodoro' ? 'Immerse yourself in the flow.' : 'Take a moment to breathe.'}
                                </p>
                            </motion.div>
                            <div className="h-6 flex justify-center mt-2">
                                {activeTask && mode === 'pomodoro' && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-[#F5E6D3] dark:bg-stone-800 rounded-full text-[#5C4D3C] dark:text-stone-300 text-xs font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#9A3412] dark:bg-orange-400" />
                                        {activeTask.title}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <TimerCircle timeLeft={timeLeft} totalTime={totalTime} mode={mode}>
                                <div className="flex flex-col items-center">
                                    <div className="text-7xl font-light tracking-tighter text-[#2D2A26] dark:text-stone-200 tabular-nums select-none">
                                        {formattedTime}
                                    </div>
                                    <p className="text-xs font-medium tracking-widest uppercase text-[#8C8884] dark:text-stone-600 mt-2">
                                        {isRunning ? 'Running' : 'Paused'}
                                    </p>
                                </div>
                            </TimerCircle>
                        </div>

                        <div className="mt-10 w-full flex justify-center">
                            <TimerControls
                                isRunning={isRunning}
                                onToggle={toggleTimer}
                                onReset={resetTimer}
                                showSkip={mode !== 'pomodoro'}
                                onSkip={() => useTimerStore.getState().setMode('pomodoro')}
                            />
                        </div>
                    </div>

                    {/* Soundscape "Mini Player" */}
                    <div className={cn(
                        "bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#F0EFEB] dark:border-stone-800 flex flex-col gap-4",
                        focusMode && "hidden"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#4A4744] dark:text-stone-400">
                                <div className="p-2 bg-[#F2F0ED] dark:bg-stone-800 rounded-xl">
                                    {audioMode === 'noise' ? <div className="h-4 w-4 bg-[#8C8884] rounded-full opacity-50" /> : <Play className="h-4 w-4 text-[#8C8884]" />}
                                </div>
                                <span className="text-sm font-medium tracking-wide">Soundscape</span>
                            </div>

                            <div className="flex bg-[#F2F0ED] dark:bg-stone-800 p-1 rounded-full">
                                <button
                                    onClick={() => setAudioMode('noise')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                                        audioMode === 'noise' ? "bg-white dark:bg-stone-700 shadow-sm text-[#2D2A26] dark:text-stone-200" : "text-[#8C8884] dark:text-stone-500 hover:text-[#4A4744] dark:hover:text-stone-300"
                                    )}
                                >
                                    Noise
                                </button>
                                <button
                                    onClick={() => setAudioMode('youtube')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
                                        audioMode === 'youtube' ? "bg-white dark:bg-stone-700 shadow-sm text-[#2D2A26] dark:text-stone-200" : "text-[#8C8884] dark:text-stone-500 hover:text-[#4A4744] dark:hover:text-stone-300"
                                    )}
                                >
                                    YouTube
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#FDFCF8] dark:bg-stone-950 rounded-2xl overflow-hidden border border-[#F0EFEB] dark:border-stone-800">
                            {audioMode === 'noise' ? <WhiteNoisePlayer /> : <YouTubePlayer />}
                        </div>
                    </div>
                </div>


                {/* --- RIGHT COLUMN: TASKS & QUOTES --- */}
                {!focusMode && (
                    <div className="lg:col-span-5 flex flex-col gap-6 order-2 animate-in fade-in slide-in-from-right-4 duration-700">
                        {/* Quote Card */}
                        <div className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-md relative overflow-hidden transition-colors duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Maximize2 className="h-32 w-32" />
                            </div>
                            <VisualQuote />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFocusMode(true)}
                                className="mt-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full text-xs border border-primary-foreground/20"
                            >
                                <Maximize2 className="h-3 w-3 mr-2" />
                                Enter Zen Mode
                            </Button>
                        </div>

                        {/* Task List */}
                        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-[#F0EFEB] dark:border-stone-800 flex-1 min-h-[400px] flex flex-col">
                            <DailyFocus />

                            <div className="mt-6 flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-[#2D2A26] dark:text-stone-200">Today's Priorities</h3>
                                <span className="text-xs font-medium text-[#8C8884] dark:text-stone-500 bg-[#F2F0ED] dark:bg-stone-800 px-2 py-1 rounded-md">{todayTasks.length}</span>
                            </div>

                            <ScrollArea className="flex-1 -mr-2 pr-2">
                                <div className="space-y-3">
                                    {todayTasks.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-48 text-[#8C8884] opacity-60">
                                            <CheckCircle2 className="h-8 w-8 mb-2" />
                                            <p className="text-sm">All cleared. Enjoy the calm.</p>
                                        </div>
                                    ) : (
                                        todayTasks.map(task => (
                                            <motion.div
                                                layoutId={task.id}
                                                key={task.id}
                                                onClick={() => setActiveTask(task.id)}
                                                className={cn(
                                                    "group flex items-start p-3 rounded-2xl transition-all cursor-pointer border border-transparent",
                                                    activeTaskId === task.id
                                                        ? "bg-[#FDFCF8] dark:bg-stone-800 border-[#E6E4E0] dark:border-stone-700 shadow-sm"
                                                        : "hover:bg-[#F9F8F6] dark:hover:bg-stone-800/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "mt-1 w-2 h-2 rounded-full mr-3 shrink-0",
                                                    task.priority === 'high' ? "bg-[#EF5350]" :
                                                        task.priority === 'normal' ? "bg-[#FFB74D]" : "bg-[#9CCC65]"
                                                )} />

                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-sm font-medium truncate transition-colors",
                                                        activeTaskId === task.id ? "text-[#2D2A26] dark:text-stone-200" : "text-[#5D5A56] dark:text-stone-400"
                                                    )}>
                                                        {task.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] text-[#8C8884] dark:text-stone-500 mt-1">
                                                        <span className="bg-[#F2F0ED] dark:bg-stone-800 px-1.5 py-0.5 rounded-md capitalize">{task.priority}</span>
                                                        <span>{task.completedPomodoros}/{task.estimatedPomodoros} pomos</span>
                                                    </div>
                                                </div>

                                                {activeTaskId === task.id && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                        <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                                                            <Play className="h-2.5 w-2.5 ml-0.5 fill-current" />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                )}

                {/* Focus Mode Exit Button (Floating) */}
                {focusMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2"
                    >
                        <Button
                            variant="secondary"
                            onClick={() => setFocusMode(false)}
                            className="rounded-full shadow-lg bg-white/90 dark:bg-stone-800/90 backdrop-blur hover:bg-white dark:hover:bg-stone-800 text-[#4A4744] dark:text-stone-200 px-6"
                        >
                            <Minimize2 className="h-4 w-4 mr-2" />
                            Exit Focus
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
