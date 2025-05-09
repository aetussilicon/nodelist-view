import { Flag, Plus, X } from "lucide-react";
import type React from "react";
import type { NewTaskProps } from "../interfaces/NewTaskProps";
import { useState } from "react";
import { TasksService } from "../services/TasksService";
import api from "../Api";
import type { TaskProps } from "../interfaces/TaskProps";
import type { TaskGroupProps } from "../interfaces/TasksGroupProps";
import { PriorityOptions } from "../consts/PriorityOptions";

interface CreateTaskModalProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setTasks: React.Dispatch<React.SetStateAction<TaskProps[]>>
    tasksGroups: TaskGroupProps[]
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, setIsOpen, setTasks, tasksGroups }) => {
    const tasksService = new TasksService(api);
    
    const [newTask, setNewTask] = useState<NewTaskProps>({
        title: "",
        description: "",
        priority: "P5",
        taskGroupId: 0,
    });

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await tasksService.createTask(newTask);
            const tasksRes = await tasksService.getTasks();
            setTasks(tasksRes);
                
            // Limpar o formulário e fechar o modal
            setNewTask({
                title: "",
                description: "",
                priority: "P5",
                taskGroupId: tasksGroups.length > 0 ? tasksGroups[0].taskGroupId : 0,
            });
            setIsOpen(false);
        } catch (err) {
            console.error("Erro ao criar tarefa:", err);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTask((prev) => ({
            ...prev,
            [name]: name === "taskGroupId" ? parseInt(value, 10) : value,
        }));
    };

    return (
        <>
            <button
                className="bg-accent hover:bg-accent/80 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                onClick={() => setIsOpen(true)}
            >
                <Plus size={20} /> Nova Tarefa
            </button>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-background p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Nova Tarefa</h2>
                            <button
                                className="text-text-primary hover:text-accent"
                                onClick={() => setIsOpen(false)}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask}>
                            <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium mb-2">
                                            Título
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={newTask.title}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded-lg bg-background-secondary border border-accent focus:outline-none focus:border-accent"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium mb-2">
                                            Descrição
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newTask.description}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded-lg bg-background-secondary border border-accent focus:outline-none focus:border-accent"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="taskGroupId" className="block text-sm font-medium mb-2">
                                            Grupo
                                </label>
                                <select
                                    id="taskGroupId"
                                    name="taskGroupId"
                                    value={newTask.taskGroupId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded-lg bg-background-secondary border border-accent focus:outline-none focus:border-accent"
                                    disabled={true} // Grupo desabilitado por enquanto
                                >
                                    {tasksGroups.map((group) => (
                                        <option key={group.taskGroupId} value={group.taskGroupId}>
                                            {group.taskGroupName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="priority" className="block text-sm font-medium mb-2">
                                            Prioridade
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {PriorityOptions.map((option) => (
                                        <div
                                            key={option.value}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer ${newTask.priority === option.value
                                                ? "bg-accent"
                                                : "bg-background-secondary hover:bg-accent/20"
                                            }`}
                                            onClick={() =>
                                                setNewTask((prev) => ({ ...prev, priority: option.value }))
                                            }
                                        >
                                            <Flag size={16} color={option.color} />
                                            <span>{option.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="bg-background-secondary hover:bg-accent/20 text-text-primary px-4 py-2 rounded-lg mr-2"
                                    onClick={() => setIsOpen(false)}
                                >
                                            Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg"
                                >
                                            Criar Tarefa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateTaskModal;