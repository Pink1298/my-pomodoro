import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PomodoroSettings, Task, TimerMode, Session, TimeBlock, Project, Subtask } from '@/types';

interface TimerState {
    timeLeft: number; // in seconds
    mode: TimerMode;
    isRunning: boolean;
    focusMode: boolean; // Zen mode
    settings: PomodoroSettings;
    setMode: (mode: TimerMode) => void;
    setTimeLeft: (time: number) => void;
    setIsRunning: (isRunning: boolean) => void;
    setFocusMode: (focusMode: boolean) => void;
    updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
    resetTimer: () => void;
    resetState: () => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    continuousMode: false,
};

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            timeLeft: 25 * 60,
            mode: 'pomodoro',
            isRunning: false,
            focusMode: false,
            settings: DEFAULT_SETTINGS,
            setMode: (mode) => {
                const { settings } = get();
                const duration =
                    mode === 'pomodoro'
                        ? settings.pomodoroDuration
                        : mode === 'shortBreak'
                            ? settings.shortBreakDuration
                            : settings.longBreakDuration;
                set({ mode, timeLeft: duration * 60, isRunning: false });
            },
            setTimeLeft: (time) => set({ timeLeft: time }),
            setIsRunning: (isRunning) => set({ isRunning }),
            setFocusMode: (focusMode) => set({ focusMode }),
            updateSettings: (newSettings) =>
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                })),
            resetTimer: () => {
                const { mode, settings } = get();
                const duration =
                    mode === 'pomodoro'
                        ? settings.pomodoroDuration
                        : mode === 'shortBreak'
                            ? settings.shortBreakDuration
                            : settings.longBreakDuration;
                set({ timeLeft: duration * 60, isRunning: false });
            },
            resetState: () => set({
                settings: DEFAULT_SETTINGS,
                mode: 'pomodoro',
                timeLeft: 25 * 60,
                isRunning: false,
                focusMode: false
            }),
        }),
        {
            name: 'pomodoro-timer-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

interface TaskState {
    tasks: Task[];
    projects: Project[];
    activeTaskId: string | null;
    deletedTaskIds: string[];
    deletedProjectIds: string[];

    // Tasks
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'subtasks'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    setActiveTask: (id: string | null) => void;
    incrementTaskPomodoro: (id: string) => void;
    setTasks: (tasks: Task[]) => void;

    // Subtasks
    addSubtask: (taskId: string, title: string) => void;
    toggleSubtask: (taskId: string, subtaskId: string) => void;
    deleteSubtask: (taskId: string, subtaskId: string) => void;

    // Projects
    addProject: (project: Omit<Project, 'id'>) => void;
    deleteProject: (id: string) => void;
    setProjects: (projects: Project[]) => void;
    clearDeletedTaskIds: (ids: string[]) => void;
    clearDeletedProjectIds: (ids: string[]) => void;
    resetState: () => void;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set) => ({
            tasks: [],
            projects: [ // Default project
                { id: 'default', name: 'Inbox', color: '#64748b' }
            ],
            activeTaskId: null,
            deletedTaskIds: [],
            deletedProjectIds: [],

            addTask: (taskData) =>
                set((state) => ({
                    tasks: [
                        ...state.tasks,
                        {
                            ...taskData,
                            id: crypto.randomUUID(),
                            createdAt: Date.now(),
                            completedPomodoros: 0,
                            subtasks: [],
                            // Ensure backward compatibility or defaults
                            priority: taskData.priority || 'normal',
                            projectId: taskData.projectId || 'default',
                            energyLevel: taskData.energyLevel || 'medium',
                        },
                    ],
                })),
            updateTask: (id, updates) =>
                set((state) => ({
                    tasks: state.tasks.map((t) => {
                        if (t.id !== id) return t;
                        const newStatus = updates.status;
                        // Set completedAt if status changes to done
                        const completedAt = newStatus === 'done' && t.status !== 'done' ? Date.now() :
                            // clear completedAt if moving back from done
                            (newStatus && newStatus !== 'done' && t.status === 'done' ? undefined : t.completedAt);

                        return { ...t, ...updates, completedAt: completedAt !== undefined ? completedAt : t.completedAt };
                    }),
                })),
            deleteTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                    activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
                    deletedTaskIds: [...state.deletedTaskIds, id]
                })),
            setActiveTask: (id) => set({ activeTaskId: id }),
            incrementTaskPomodoro: (id) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
                    ),
                })),
            setTasks: (tasks) => set({ tasks }),

            // Subtasks
            addSubtask: (taskId, title) =>
                set((state) => ({
                    tasks: state.tasks.map(t =>
                        t.id === taskId
                            ? { ...t, subtasks: [...(t.subtasks || []), { id: crypto.randomUUID(), title, completed: false }] }
                            : t
                    )
                })),
            toggleSubtask: (taskId, subtaskId) =>
                set((state) => ({
                    tasks: state.tasks.map(t =>
                        t.id === taskId
                            ? {
                                ...t,
                                subtasks: (t.subtasks || []).map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
                            }
                            : t
                    )
                })),
            deleteSubtask: (taskId, subtaskId) =>
                set((state) => ({
                    tasks: state.tasks.map(t =>
                        t.id === taskId
                            ? { ...t, subtasks: (t.subtasks || []).filter(s => s.id !== subtaskId) }
                            : t
                    )
                })),

            // Projects
            addProject: (project) =>
                set((state) => ({
                    projects: [...state.projects, { ...project, id: crypto.randomUUID() }]
                })),
            deleteProject: (id) => {
                // Determine what to do with tasks in deleted project - move to default?
                set((state) => ({
                    projects: state.projects.filter(p => p.id !== id),
                    tasks: state.tasks.map(t => t.projectId === id ? { ...t, projectId: 'default' } : t),
                    deletedProjectIds: [...state.deletedProjectIds, id]
                }));
            },

            setProjects: (projects) => set({ projects }),
            clearDeletedTaskIds: (ids) => set((state) => ({
                deletedTaskIds: state.deletedTaskIds.filter(id => !ids.includes(id))
            })),
            clearDeletedProjectIds: (ids) => set((state) => ({
                deletedProjectIds: state.deletedProjectIds.filter(id => !ids.includes(id))
            })),
            resetState: () => set({
                tasks: [],
                projects: [{ id: 'default', name: 'Inbox', color: '#64748b' }],
                activeTaskId: null,
                deletedTaskIds: [],
                deletedProjectIds: []
            }),
        }),
        {
            name: 'pomodoro-task-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

interface DailyJournal {
    date: string;
    intention: string;
    reflection?: string;
    mood?: 'great' | 'good' | 'neutral' | 'bad';
}

interface StatsState {
    sessions: Session[];
    dailyStreak: number;
    lastFocusDate: string | null;
    currentDailyIntention: string | null;
    journal: DailyJournal[];
    addSession: (session: Omit<Session, 'id'>) => void;
    setDailyIntention: (intention: string) => void;
    addDailyReflection: (reflection: string, mood?: DailyJournal['mood']) => void;
    hydrateStats: (state: Partial<StatsState>) => void;
    resetState: () => void;
}

export const useStatsStore = create<StatsState>()(
    persist(
        (set, get) => ({
            sessions: [],
            dailyStreak: 0,
            lastFocusDate: null,
            currentDailyIntention: null,
            journal: [],
            addSession: (session) => {
                const now = new Date();
                const today = now.toISOString().split('T')[0];
                const { lastFocusDate, dailyStreak } = get();

                let newStreak = dailyStreak;

                if (lastFocusDate !== today) {
                    const yesterday = new Date(now);
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastFocusDate === yesterdayStr) {
                        newStreak += 1;
                    } else {
                        newStreak = 1; // Reset or start new
                    }
                }

                set((state) => ({
                    sessions: [
                        ...state.sessions,
                        { ...session, id: crypto.randomUUID() },
                    ],
                    lastFocusDate: today,
                    dailyStreak: newStreak
                }));
            },
            setDailyIntention: (intention) => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => {
                    // Check if journal entry for today exists
                    const existingIndex = state.journal.findIndex(j => j.date === today);
                    let newJournal = [...state.journal];

                    if (existingIndex >= 0) {
                        newJournal[existingIndex] = { ...newJournal[existingIndex], intention };
                    } else {
                        newJournal.push({ date: today, intention });
                    }
                    return { currentDailyIntention: intention, journal: newJournal };
                });
            },
            addDailyReflection: (reflection, mood) => {
                const today = new Date().toISOString().split('T')[0];
                set((state) => {
                    const existingIndex = state.journal.findIndex(j => j.date === today);
                    let newJournal = [...state.journal];

                    if (existingIndex >= 0) {
                        newJournal[existingIndex] = { ...newJournal[existingIndex], reflection, mood };
                    } else {
                        // Should technically have an intention first, but handle safe case
                        newJournal.push({ date: today, intention: '', reflection, mood });
                    }
                    return { journal: newJournal };
                });
            },
            hydrateStats: (newState) => set((state) => ({ ...state, ...newState })),
            resetState: () => set({
                sessions: [],
                dailyStreak: 0,
                lastFocusDate: null,
                currentDailyIntention: null,
                journal: []
            }),
        }),
        {
            name: 'pomodoro-stats-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

interface ScheduleState {
    blocks: TimeBlock[];
    addBlock: (block: Omit<TimeBlock, 'id'>) => void;
    removeBlock: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>()(
    persist(
        (set) => ({
            blocks: [],
            addBlock: (block) => set((state) => ({
                blocks: [...state.blocks, { ...block, id: crypto.randomUUID() }]
            })),
            removeBlock: (id) => set((state) => ({
                blocks: state.blocks.filter((b) => b.id !== id)
            })),
        }),
        {
            name: 'pomodoro-schedule-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
// Phase 9: Theme Store
import { ColorTheme, FontTheme } from "@/types";

interface ThemeStoreState {
    colorTheme: ColorTheme;
    fontTheme: FontTheme;
    circadianMode: boolean;
    setColorTheme: (theme: ColorTheme) => void;
    setFontTheme: (font: FontTheme) => void;
    toggleCircadianMode: () => void;
}

export const useThemeSettingsStore = create<ThemeStoreState>()(
    persist(
        (set) => ({
            colorTheme: 'stone',
            fontTheme: 'sans',
            circadianMode: false,
            setColorTheme: (theme) => set({ colorTheme: theme }),
            setFontTheme: (font) => set({ fontTheme: font }),
            toggleCircadianMode: () => set((state) => ({ circadianMode: !state.circadianMode })),
        }),
        {
            name: 'theme-settings-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
