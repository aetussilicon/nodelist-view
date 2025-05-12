import type React from "react";
import type { TaskProps } from "../interfaces/TaskProps";
import { useState } from "react";
import { ChevronDown, Flag, Pencil } from "lucide-react";
import { PriorityOptions } from "../consts/PriorityOptions";

interface TaskCardProps {
  task: TaskProps;
  onTaskComplete?: (taskId: number, completed: boolean) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskComplete }) => {

    const [expandedDesc, setExpandedDesc] = useState<Record<number, boolean>>({}); 
    const [isCompleted, setIsCompleted] = useState<boolean>(task.completed);

    const toggleTaskDesc = (taskId: number) => {
        setExpandedDesc((prev) => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const handleTaskCompletion = () => {
        const newCompletionState = !isCompleted;
        setIsCompleted(newCompletionState);
        
        // Se houver um callback de conclusão, chame-o
        if (onTaskComplete) {
            onTaskComplete(task.taskId, newCompletionState);
        }
    };

    const getFlagColor = (priority: string) => {
        const option = PriorityOptions.find((opt) => opt.value === priority);
        return option ? option.color : "#808080";
    };
  
    return (
        <>
            <div className={`bg-background p-4 rounded-lg ${isCompleted ? 'opacity-70' : ''}`}>
                <div className="flex flex-col">
                    <div className="flex justify-between">
                        <div>
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={isCompleted}
                                onChange={handleTaskCompletion}
                                id={`task-${task.taskId}`}
                            />
                            <label 
                                htmlFor={`task-${task.taskId}`} 
                                className={`xl:text-xl font-bold ${isCompleted ? 'line-through text-gray-400' : ''}`}
                            >
                                {task.title}
                            </label>
                            {isCompleted && <span className="text-green-500 ml-2">✓</span>}
                        </div>
                        <div className="flex items-center gap-2 flex-row-reverse">
                            {task.description && task.description.length > 50 && (
                                <button 
                                    type="button" 
                                    onClick={() => toggleTaskDesc(task.taskId)} 
                                    className={`text-gray-500 hover:text-gray-300 
                                ${expandedDesc[task.taskId] ? "-rotate-180" : ""} 
                                transition-transform duration-200 `}
                                >
                                    <ChevronDown size={18}/>
                                </button>)}
                            <button>
                                <Pencil size={18}/>
     
                            </button>
                            <Flag size={18}
                                color={getFlagColor(task.priority)}
                                fill={getFlagColor(task.priority)}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                    {isCompleted && (
                        <span className="text-[0.65rem]">
                            <strong>Concluído em: </strong>
                            {task.completedAt || new Date().toLocaleDateString('pt-BR')}
                        </span>
                    )}
                </div>
                {task.description != null && (
                    <div>
                        <p className="text-sm text-gray-300 mt-2">
                            {!expandedDesc[task.taskId]
                                ? `${task.description.substring(0, 50)}${
                                    task.description.length > 50 ? "..." : ""
                                }`
                                : task.description}
                        </p>
                    </div>
                )}
                <div className="h-[1px] bg-gray-400 mt-3"/>
                <div className="flex justify-between mt-2">
                    <span className="text-[0.65rem]">
                        <strong>Criado: </strong>  
                        {task.createdAt}
                    </span>
                    {task.updatedAt && (
                        <span className="text-[0.65rem] ml-2">
                            <strong>Atualizado: </strong>
                            {task.updatedAt}
                        </span>
                    )}
                </div>
            </div> 
        </>
    );
};

export default TaskCard;
