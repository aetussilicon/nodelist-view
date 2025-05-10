import type { TaskProps } from "./TaskProps";

export interface TaskGroupProps {
    taskGroupId: number;
    taskGroupName: string;
    tasks: TaskProps[]
    createdAt: string;
    updatedAt: string;
}
