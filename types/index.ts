export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
export type Priority = 'low' | 'normal' | 'high';

export interface PomodoroSettings {
  pomodoroDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  continuousMode: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string; // Hex code or Tailwind class
}

export type EnergyLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  completedPomodoros: number;
  estimatedPomodoros: number;
  createdAt: number;
  // Phase 2 additions
  priority: Priority;
  projectId?: string;
  dueDate?: number;
  subtasks: Subtask[];
  // Phase 8 additions
  energyLevel?: EnergyLevel;
  // Phase 15 additions
  completedAt?: number;
}

export interface Session {
  id: string;
  duration: number; // minutes
  finishedAt: number; // timestamp
  taskId?: string;
  projectId?: string;
}

export interface TimeBlock {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "09:00"
  endTime?: string; // "10:00"
  activity: string;
  taskId?: string; // Link to a task
}
export type ColorTheme = 'stone' | 'blue' | 'rose' | 'green' | 'orange';
export type FontTheme = 'sans' | 'serif' | 'mono';
