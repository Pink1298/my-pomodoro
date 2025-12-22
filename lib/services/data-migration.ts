import { CloudDataService } from "./cloud-data";
import { useTaskStore, useTimerStore, useStatsStore } from "@/lib/store";
import { toast } from "sonner";

export const DataMigrationService = {
    async mergeLocalDataWithType(userId: string) {
        // 1. Check if we have local data worth merging
        // We assume "local data" is whatever is currently in the store 
        // IF the user was previously anonymous. 
        // Ideally, we'd check a flag, but for now, let's just look at the store content.

        const localTasks = useTaskStore.getState().tasks;
        const localSettings = useTimerStore.getState().settings;
        // const localStats = useStatsStore.getState(); 

        if (localTasks.length === 0) {
            console.log("No local tasks to migrate.");
            return;
        }

        try {
            // 2. Fetch remote data to see if this is a fresh account or valid existing one
            const remoteTasks = await CloudDataService.fetchTasks(userId);

            // 3. Strategy: Union Merge
            // We upload ALL local tasks to the cloud. 
            // Since IDs are UUIDs generated locally, collisions are extremely unlikely.
            // If the user already has data on cloud, we just append local stuff.

            await CloudDataService.upsertTasks(localTasks, userId);

            // 4. Settings: Prefer Local if modified? Or Remote?
            // Let's assume Cloud settings win if they exist, otherwise push local.
            const remoteSettings = await CloudDataService.fetchSettings(userId);
            if (!remoteSettings) {
                await CloudDataService.saveSettings(localSettings, userId);
            } else {
                // Update local store to match cloud
                useTimerStore.getState().updateSettings(remoteSettings);
            }

            toast.success(`Migrated ${localTasks.length} local tasks to cloud account.`);

        } catch (error) {
            console.error("Migration failed:", error);
            toast.error("Failed to migrate local data.");
        }
    }
};
