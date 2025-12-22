"use client";

import { useState } from "react";
import { useTaskStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, FolderPlus, Circle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const COLORS = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
    "#64748b", // slate (default)
];

export function ProjectManager() {
    const { projects, addProject, deleteProject } = useTaskStore();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [selectedColor, setSelectedColor] = useState(COLORS[8]);

    const handleAdd = () => {
        if (!name.trim()) return;
        addProject({
            name,
            color: selectedColor,
        });
        setName("");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                    <FolderPlus className="mr-2 h-3.5 w-3.5" />
                    Projects
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Projects</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[40px] px-0 bg-background">
                                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedColor }} />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3">
                                <div className="grid grid-cols-3 gap-2">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            className={cn("h-6 w-6 rounded-full border border-muted hover:scale-110 transition",
                                                selectedColor === color && "ring-2 ring-offset-1 ring-primary"
                                            )}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setSelectedColor(color)}
                                        />
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Input
                            placeholder="New project name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <Button onClick={handleAdd}>Add</Button>
                    </div>

                    <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
                        {projects.map(project => (
                            <div key={project.id} className="flex items-center justify-between p-2 rounded-lg border bg-card text-card-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                                    <span className="text-sm font-medium">{project.name}</span>
                                </div>
                                {project.id !== 'default' && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteProject(project.id)}>
                                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
