"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTaskStore, useTimerStore, useStatsStore } from "@/lib/store";
import { toast } from "sonner";
import { CloudDataService } from "@/lib/services/cloud-data";
import { DataMigrationService } from "@/lib/services/data-migration";

export function SyncManager() {
    const supabase = createClient();
    const { tasks, setTasks, projects, setProjects } = useTaskStore();
    const { settings, updateSettings } = useTimerStore();
    const { sessions, dailyStreak, lastFocusDate, journal, hydrateStats } = useStatsStore();

    // 1. Auth & Initial Load Logic
    useEffect(() => {
        const setupSubscription = async () => {
            const isConfigured =
                process.env.NEXT_PUBLIC_SUPABASE_URL &&
                process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!isConfigured) return;

            // Auth Listener
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    // Clear local data (privacy)
                    useTaskStore.getState().resetState();
                    useTimerStore.getState().resetState();
                    useStatsStore.getState().resetState();
                    toast.success("Logged out. Local data cleared.");
                }
                // else if (event === 'SIGNED_IN') {
                //     if (session?.user) {
                //         toast.loading("Syncing data...");
                //         // 1. Try Migration (Merge local -> remote)
                //         await DataMigrationService.mergeLocalDataWithType(session.user.id);

                //         // 2. Fetch Latest (Remote -> Local)
                //         await loadUserData(session.user.id);
                //         toast.dismiss();
                //         toast.success("Sync complete!");
                //     }
                // }
            });

            // Initial Check (if already logged in)
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await loadUserData(user.id);
            }

            return () => subscription.unsubscribe();
        };

        setupSubscription();
    }, [supabase]);

    // Helper: Load all data from cloud
    const loadUserData = async (userId: string) => {
        try {
            const [remoteTasks, remoteProjects, remoteSettings, remoteSessions] = await Promise.all([
                CloudDataService.fetchTasks(userId),
                CloudDataService.fetchProjects(userId),
                CloudDataService.fetchSettings(userId),
                // CloudDataService.fetchSessions(userId) // Future Implementation: Sync Sessions/Stats fully
                Promise.resolve(null)
            ]);

            if (remoteTasks) setTasks(remoteTasks);
            if (remoteProjects) setProjects(remoteProjects);
            if (remoteSettings) updateSettings(remoteSettings);

            // Stats/Sessions: Currently we stick to simpler sync or need full implementation
            // For now, let's just ensure tasks/settings/projects are rock solid.

        } catch (error) {
            console.error("Failed to load user data:", error);
            toast.error("Failed to load cloud data.");
        }
    };

    // 2. Realtime / Push Logic (Debounced)

    // Tasks Push
    useEffect(() => {
        if (!tasks.length) return;
        const push = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log("Syncing tasks to cloud...", tasks.length);
                try {
                    await CloudDataService.upsertTasks(tasks, user.id);
                } catch (err) {
                    console.error("Task sync failed", err);
                }
            }
        };
        const t = setTimeout(push, 2000); // Reduce debounce to 2s
        return () => clearTimeout(t);
    }, [tasks, supabase]);

    // Projects Push
    useEffect(() => {
        if (!projects.length) return;
        const push = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await CloudDataService.upsertProjects(projects, user.id);
            }
        };
        const t = setTimeout(push, 2000);
        return () => clearTimeout(t);
    }, [projects, supabase]);

    // Settings Push
    useEffect(() => {
        const push = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await CloudDataService.saveSettings(settings, user.id);
        };
        const t = setTimeout(push, 2000);
        return () => clearTimeout(t);
    }, [settings, supabase]);

    // Sessions Push
    useEffect(() => {
        if (!sessions.length) return;
        const push = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await CloudDataService.upsertSessions(sessions, user.id);
        };
        const t = setTimeout(push, 5000);
        return () => clearTimeout(t);
    }, [sessions, supabase]);

    return null;
}
