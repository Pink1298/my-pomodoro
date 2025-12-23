"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Toaster } from "@/components/ui/sonner";
import { useTimerStore } from "@/lib/store";
import { WelcomeModal } from "@/components/onboarding/welcome-modal";
import { SyncManager } from "@/components/sync/sync-manager";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { focusMode } = useTimerStore();

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden w-64 md:block border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
                focusMode && "w-0 overflow-hidden border-none opacity-0"
            )}>
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
                {/* Mobile Header */}
                <header className={cn(
                    "flex items-center px-4 py-3 md:hidden border-b border-border transition-all",
                    focusMode && "hidden"
                )}>
                    <MobileNav />
                    <span className="ml-2 font-bold text-lg">Pomodoro</span>
                </header>

                {/* Page Content */}
                <main className={cn(
                    "flex-1 overflow-y-auto p-4 md:p-8 transition-all",
                    focusMode && "flex items-center justify-center p-0 md:p-0"
                )}>
                    <div className={cn("mx-auto max-w-[90%] h-full transition-all", focusMode && "w-full max-w-none")}>
                        {children}
                    </div>
                </main>
            </div>
            <Toaster />
            <WelcomeModal />
            <SyncManager />
        </div>
    );
}
