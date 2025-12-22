"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTaskStore } from "@/lib/store";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    RadioGroup,
    RadioGroupItem
} from "@/components/ui/radio-group";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    estimatedPomodoros: z.coerce.number().min(1, "Must be at least 1"),
    priority: z.enum(["low", "normal", "high"]),
    energyLevel: z.enum(["low", "medium", "high"]).optional(),
    projectId: z.string(),
    dueDate: z.string().optional(),
});

interface TaskFormProps {
    taskToEdit?: any; // Replace with Task type
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function TaskForm({ taskToEdit, open: controlledOpen, onOpenChange: setControlledOpen, trigger }: TaskFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { addTask, updateTask, projects } = useTaskStore();

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: taskToEdit ? {
            title: taskToEdit.title,
            description: taskToEdit.description || "",
            estimatedPomodoros: taskToEdit.estimatedPomodoros,
            priority: taskToEdit.priority,
            energyLevel: taskToEdit.energyLevel || "medium",
            projectId: taskToEdit.projectId || "default",
            dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : undefined,
        } : {
            title: "",
            description: "",
            estimatedPomodoros: 1,
            priority: "normal",
            energyLevel: "medium",
            projectId: "default",
            dueDate: undefined,
        },
    });

    // Reset form when taskToEdit changes or dialog opens
    // useEffect(() => {
    //    if (open) form.reset(taskToEdit ? ... : ...);
    // }, [open, taskToEdit, form]);

    function onSubmit(values: any) {
        // Convert date string to timestamp
        const finalValues = {
            ...values,
            dueDate: values.dueDate ? new Date(values.dueDate).getTime() : undefined
        };

        if (taskToEdit) {
            updateTask(taskToEdit.id, finalValues);
        } else {
            addTask({ ...finalValues, status: 'todo' });
        }
        form.reset();
        if (setOpen) setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            ) : (
                !isControlled && (
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    </DialogTrigger>
                )
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{taskToEdit ? "Edit Task" : "Add New Task"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="What are you working on?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="estimatedPomodoros"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Est. Pomodoros</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={1} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="projectId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select project" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {projects.map(p => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    <span className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                                                        {p.name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Priority</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-1 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="low" className="border-blue-500 text-blue-500" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-muted-foreground">Low</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-1 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="normal" className="border-gray-500 text-gray-500" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-muted-foreground">Normal</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-1 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="high" className="border-red-500 text-red-500" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-muted-foreground">High</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="energyLevel"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Energy Level</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex space-x-4"
                                        >
                                            <FormItem className="flex items-center space-x-1 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="low" className="border-green-500 text-green-500" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-muted-foreground">⚡</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-1 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="medium" className="border-yellow-500 text-yellow-500" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-muted-foreground">⚡⚡</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-1 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="high" className="border-red-500 text-red-500" />
                                                </FormControl>
                                                <FormLabel className="font-normal text-muted-foreground">⚡⚡⚡</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Add notes..." className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full">{taskToEdit ? "Save Changes" : "Create Task"}</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
