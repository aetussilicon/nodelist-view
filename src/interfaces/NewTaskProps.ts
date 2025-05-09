import type { PriorityOption } from "../consts/PriorityOptions";

export interface NewTaskProps {
    title: string;
    description: string;
    priority: PriorityOption;
    taskGroupId: number;
}