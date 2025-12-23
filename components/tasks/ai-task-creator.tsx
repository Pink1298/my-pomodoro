"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { generateTaskFromPrompt } from "@/actions/generate-task";
import { useTaskStore } from "@/lib/store";
import { toast } from "sonner";

export function AITaskCreator() {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const { addTask } = useTaskStore();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const taskData = await generateTaskFromPrompt(prompt);

            // Convert dueDate string to timestamp if present
            const finalTask = {
                ...taskData,
                dueDate: taskData.dueDate ? new Date(taskData.dueDate).getTime() : undefined,
                status: 'todo'
            };

            addTask(finalTask);
            toast.success("Task created from magic!");
            setOpen(false);
            setPrompt("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate task. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex border-purple-200 hover:bg-purple-50 hover:text-purple-600 dark:border-purple-900 dark:hover:bg-purple-900/20 dark:hover:text-purple-400">
                    <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                    Magic Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Magic Task
                    </DialogTitle>
                    <DialogDescription>
                        Describe your task in natural language, AI will help you create it.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Example: 'Read 20 pages of clean code tomorrow with high energy'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isGenerating ? "Generating..." : "Create Task"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
