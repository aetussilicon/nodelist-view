import type {TaskGroupProps} from "./TasksGroupProps.ts";

export interface TaskProps {
    taskId: number;
    title: string;
    description: string;
    priority: string;
    taskGroup: TaskGroupProps;
    createdAt: string;
    updatedAt: string;
}