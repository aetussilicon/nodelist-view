import type {TaskGroupProps} from "./TasksGroupProps.ts";

export interface TaskProps {
    taskId: number;
    title: string;
    description: string;
    priority: string;
    taskGroup: TaskGroupProps;
    completed: boolean;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
}