import { ChevronDown } from "lucide-react";
import type { TaskGroupProps } from "../interfaces/TasksGroupProps";
import TaskCard from "./TaskCard";

const Groups = () => {
    // Mock data based on TaskGroupDTO
    const taskGroups: TaskGroupProps[] = [
        {
            taskGroupId: 1,
            taskGroupName: "Work Tasks",
            tasks: [
                {
                    taskId: 1,
                    title: "Complete project report",
                    description: "Finish the quarterly report for the client",
                    priority: "HIGH",
                    completed: false,
                    completedAt: null,
                    createdAt: "12/05/2023 14:30",
                    updatedAt: "13/05/2023 10:15"
                },
                {
                    taskId: 2,
                    title: "Team meeting",
                    description: "Weekly sync with development team",
                    priority: "MEDIUM",
                    completed: true,
                    completedAt: "10/05/2023 11:30",
                    createdAt: "10/05/2023 09:00",
                    updatedAt: "10/05/2023 11:30"
                }
            ],
            createdAt: "05/05/2023 08:00",
            updatedAt: "12/05/2023 16:45"
        },
        {
            taskGroupId: 2,
            taskGroupName: "Personal Tasks",
            tasks: [
                {
                    taskId: 3,
                    title: "Grocery shopping",
                    description: "Buy food for the week",
                    priority: "LOW",
                    completed: false,
                    completedAt: null,
                    createdAt: "11/05/2023 18:20",
                    updatedAt: "11/05/2023 18:20"
                }
            ],
            createdAt: "01/05/2023 20:10",
            updatedAt: "11/05/2023 18:20"
        }
    ];

    return (
        <>
            {taskGroups.map((group) => (
              <div key={group.taskGroupId}>
                <div className="bg-accent text-white p-2 rounded-lg mb-4 font-bold flex items-center justify-between">
                    <h1>{group.taskGroupName}</h1>
                    <ChevronDown />
                </div>
                <div className="bg-background-secondary text-text-primary p-4 rounded-lg">
                    {group.tasks.map((task) => (
                        <div key={task.taskId} className="mb-2">
                            <TaskCard
                                task={task} />
                        </div>
                    ))}
                </div>
              </div>  
            )) }
        </>
    );
}

export default Groups;