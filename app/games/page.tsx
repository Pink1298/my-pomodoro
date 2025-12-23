"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Grid3X3, Gamepad2, Calculator, Palette, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const GAMES = [
    {
        id: "sudoku",
        name: "Sudoku",
        description: "Classic logic puzzle to sharpen your deduction skills.",
        icon: Grid3X3,
        color: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        href: "/games/sudoku",
    },
    {
        id: "memory",
        name: "Memory Match",
        description: "Test your short-term memory by finding matching pairs.",
        icon: LayoutGrid, // Using LayoutGrid as a proxy for cards
        color: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        href: "/games/memory",
    },
    {
        id: "2048",
        name: "2048",
        description: "Slide tiles to reach the number 2048. Needs planning!",
        icon: Gamepad2,
        color: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        href: "/games/2048",
    },
    {
        id: "math",
        name: "Math Rush",
        description: "Solve arithmetic problems against the clock.",
        icon: Calculator,
        color: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
        href: "/games/math",
    },
    {
        id: "stroop",
        name: "Stroop Test",
        description: "Challenge your cognitive control. Don't read the word!",
        icon: Palette,
        color: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
        href: "/games/stroop",
    },
];

export default function GamesPage() {
    return (
        <div className="container mx-auto p-8 max-w-6xl h-[calc(100vh-2rem)] flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-light tracking-tight text-foreground flex items-center gap-3">
                    <Brain className="h-8 w-8 text-primary" />
                    Brain Training
                </h1>
                <p className="text-muted-foreground mt-2 text-lg font-light">
                    Take a mindful break. Sharpen your focus with these cognitive exercises.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-auto pb-8">
                {GAMES.map((game, index) => (
                    <Link href={game.href} key={game.id} className="block group h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="h-full bg-card hover:bg-accent/50 border border-border rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col"
                        >
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors", game.color)}>
                                <game.icon className={cn("h-7 w-7", game.iconColor)} />
                            </div>

                            <h3 className="text-xl font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                                {game.name}
                            </h3>

                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {game.description}
                            </p>

                            <div className="mt-auto pt-6 flex items-center text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                                Play Now
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
