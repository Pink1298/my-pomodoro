"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Timer, CheckSquare, BarChart2, Settings, Coffee, Calendar, Gamepad2 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { StreakIndicator } from "@/components/habits/streak-indicator";
import AuthButton from "@/components/auth/auth-button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    const routes = [
        {
            label: "Timer",
            icon: Timer,
            href: "/",
            active: pathname === "/",
        },
        {
            label: "Tasks",
            icon: CheckSquare,
            href: "/tasks",
            active: pathname === "/tasks",
        },
        {
            label: "Schedule",
            icon: Calendar,
            href: "/schedule",
            active: pathname === "/schedule",
        },
        {
            label: "Stats",
            icon: BarChart2,
            href: "/stats",
            active: pathname === "/stats",
        },
        {
            label: "Brain Training",
            icon: Gamepad2,
            href: "/games",
            active: pathname.startsWith("/games"),
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/settings",
            active: pathname === "/settings",
        },
    ];

    return (
        <div className={cn("pb-12 h-screen border-r bg-sidebar flex flex-col", className)}>
            <div className="space-y-4 py-4 flex-1">
                <div className="px-4 py-2 flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                        <Coffee className="h-6 w-6 text-primary" />
                        <h2 className="text-lg font-bold tracking-tight text-sidebar-foregroun">
                            Pomodoro
                        </h2>
                    </div>
                </div>
                <div className="px-4 pb-2">
                    <StreakIndicator />
                </div>
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant={route.active ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    route.active && "bg-sidebar-accent text-sidebar-accent-foreground"
                                )}
                                asChild
                            >
                                <Link href={route.href}>
                                    <route.icon className="mr-2 h-4 w-4" />
                                    {route.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 mt-auto">
                <AuthButton />
            </div>

            <div className="px-4 py-4 border-t">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Appearance</span>
                    <ModeToggle />
                </div>
            </div>
        </div>
    );
}
