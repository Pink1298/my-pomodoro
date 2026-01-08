import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskItem } from "./task-item";
import { Task } from "@/types";

interface SortableTaskItemProps {
    task: Task;
}

export function SortableTaskItem({ task }: SortableTaskItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : "auto",
        position: isDragging ? "relative" as const : undefined, // Ensure it stays visible above others
    };

    return (
        <div ref={setNodeRef} style={style} className="touch-none">
            <TaskItem
                task={task}
                dragAttributes={attributes}
                dragListeners={listeners}
            />
        </div>
    );
}
