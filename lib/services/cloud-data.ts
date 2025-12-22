import { createClient } from "@/lib/supabase/client";
import { Task, Project, PomodoroSettings, Session } from "@/types";

// --- Mappers (Anti-Corruption Layer) ---

// DB Types (Snake Case)
interface DbTask {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    energy_level: string;
    estimated_pomodoros: number;
    completed_pomodoros: number;
    project_id: string;
    created_at: number; // Stored as bigint in DB, but returned as number/string
    due_date: string | null;
    updated_at: string;
}

interface DbProject {
    id: string;
    user_id: string;
    name: string;
    color: string | null;
    created_at: string;
}

interface DbSession {
    id: string;
    user_id: string;
    start_time: number;
    duration: number;
    mode: string;
    completed: boolean;
    project_id: string | null;
    task_id: string | null;
    created_at: string;
}

export const CloudDataService = {
    // --- Tasks ---
    async fetchTasks(userId: string): Promise<Task[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error("Error fetching tasks:", error);
            throw error;
        }

        return (data as any[]).map(mapTaskFromDb);
    },

    async upsertTasks(tasks: Task[], userId: string) {
        const supabase = createClient();
        if (!tasks.length) return;

        const dbTasks = tasks.map(t => mapTaskToDb(t, userId));
        const { error } = await supabase.from('tasks').upsert(dbTasks);

        if (error) {
            console.error("Error upserting tasks:", error);
            throw error;
        }
    },

    async deleteTasks(ids: string[], userId: string) {
        const supabase = createClient();
        if (!ids.length) return;

        const { error } = await supabase
            .from('tasks')
            .delete()
            .in('id', ids)
            .eq('user_id', userId);

        if (error) {
            console.error("Error deleting tasks:", error);
            throw error;
        }
    },

    // --- Projects ---
    async fetchProjects(userId: string): Promise<Project[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return (data as any[]).map(p => ({
            id: p.id,
            name: p.name,
            color: p.color || '#64748b'
        }));
    },

    async upsertProjects(projects: Project[], userId: string) {
        const supabase = createClient();
        if (!projects.length) return;

        const dbProjects = projects.map(p => ({
            id: p.id,
            user_id: userId,
            name: p.name,
            color: p.color,
            created_at: new Date().toISOString() // upsert updates time
        }));

        const { error } = await supabase.from('projects').upsert(dbProjects);
        if (error) throw error;
    },

    async deleteProjects(ids: string[], userId: string) {
        const supabase = createClient();
        if (!ids.length) return;

        const { error } = await supabase
            .from('projects')
            .delete()
            .in('id', ids)
            .eq('user_id', userId);

        if (error) {
            console.error("Error deleting projects:", error);
            throw error;
        }
    },

    // --- Settings ---
    async fetchSettings(userId: string): Promise<PomodoroSettings | null> {
        const supabase = createClient();
        const { data } = await supabase
            .from('user_settings')
            .select('settings')
            .eq('user_id', userId)
            .single();

        return data?.settings || null;
    },

    async saveSettings(settings: PomodoroSettings, userId: string) {
        const supabase = createClient();
        await supabase.from('user_settings').upsert({
            user_id: userId,
            settings,
            updated_at: new Date().toISOString()
        });
    },

    // --- Sessions (Stats) ---
    async fetchSessions(userId: string): Promise<Session[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('pomodoro_sessions')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error("Error fetching sessions:", error);
            throw error;
        }

        return (data as any[]).map(s => ({
            id: s.id,
            duration: s.duration,
            finishedAt: Number(s.start_time),
            taskId: s.task_id
        }));
    },

    async upsertSessions(sessions: Session[], userId: string) {
        const supabase = createClient();
        if (!sessions.length) return;

        // Map frontend sessions to DB sessions
        const dbSessions = sessions.map(s => ({
            id: s.id,
            user_id: userId,
            start_time: s.finishedAt, // Mapping finishedAt -> start_time
            duration: s.duration,
            mode: 'pomodoro', // Defaulting as we don't strictly track mode in Session type yet?
            completed: true,
            task_id: s.taskId || null,
            created_at: new Date(s.finishedAt).toISOString() // Approximate created_at
        }));

        const { error } = await supabase.from('pomodoro_sessions').upsert(dbSessions);
        if (error) {
            console.error("Error upserting sessions:", error);
            throw error;
        }
    }

};

// Helpers
function mapTaskFromDb(db: any): Task {
    return {
        id: db.id,
        title: db.title,
        description: db.description,
        status: db.status || 'todo',
        completedPomodoros: db.completed_pomodoros || 0,
        estimatedPomodoros: db.estimated_pomodoros || 1,
        createdAt: db.created_at ? Number(db.created_at) : Date.now(),
        priority: db.priority || 'normal',
        projectId: db.project_id || 'default',
        dueDate: db.due_date ? new Date(db.due_date).getTime() : undefined,
        subtasks: typeof db.subtasks === 'string' ? JSON.parse(db.subtasks) : (db.subtasks || []),
        energyLevel: db.energy_level || 'medium'
    };
}

function mapTaskToDb(task: Task, userId: string) {
    return {
        id: task.id,
        user_id: userId,
        title: task.title,
        description: task.description,
        status: task.status,
        completed_pomodoros: task.completedPomodoros,
        estimated_pomodoros: task.estimatedPomodoros,
        created_at: task.createdAt,
        priority: task.priority,
        project_id: task.projectId,
        due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        energy_level: task.energyLevel,
        subtasks: JSON.stringify(task.subtasks || [])
    };
}
