import { Flag, Plus, X } from "lucide-react";
import type React from "react";
import type { NewTaskProps } from "../interfaces/NewTaskProps";
import { useState } from "react";
import { TasksService } from "../services/TasksService";
import api from "../Api";
import type { TaskProps } from "../interfaces/TaskProps";
import type { TaskGroupProps } from "../interfaces/TasksGroupProps";
import { PriorityOptions } from "../consts/PriorityOptions";
import { TasksGroupsService } from "../services/TasksGroupsService";

interface CreateTaskModalProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setTasks: React.Dispatch<React.SetStateAction<TaskProps[]>>
    availableGroups: TaskGroupProps[]
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, setIsOpen, setTasks, availableGroups }) => {
    const tasksService = new TasksService(api);
    const tasksGroupsService = new TasksGroupsService(api);
    
    const [newTask, setNewTask] = useState<NewTaskProps>({
        title: "",
        description: "",
        priority: "P5",
        taskGroup: 1, // No group como padrão (id 1)
    });
    
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState<string>("");

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const taskToCreate = { ...newTask };
            
            // Se está criando um novo grupo, primeiro cria o grupo
            if (isCreatingNewGroup && newGroupName.trim()) {
                const newGroup = await tasksGroupsService.createTaskGroup(newGroupName);
                taskToCreate.taskGroup = newGroup.taskGroupId;
            }
            
            await tasksService.createTask(taskToCreate);
            const tasksRes = await tasksService.getTasks();
            setTasks(tasksRes);
                
            // Limpar o formulário e fechar o modal
            setNewTask({
                title: "",
                description: "",
                priority: "P5",
                taskGroup: 1, // Resetar para "No group"
            });
            setIsCreatingNewGroup(false);
            setNewGroupName("");
            setIsOpen(false);
        } catch (err) {
            console.error("Erro ao criar tarefa:", err);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === "taskGroup") {
            const parsedValue = parseInt(value, 10);
            // Se o valor for -1, o usuário selecionou "Criar novo grupo"
            if (parsedValue === -1) {
                setIsCreatingNewGroup(true);
            } else {
                setIsCreatingNewGroup(false);
                setNewTask((prev) => ({
                    ...prev,
                    taskGroup: parsedValue
                }));
            }
        } else {
            setNewTask((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
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
                                <label htmlFor="taskGroup" className="block text-sm font-medium mb-2">
                                            Grupo
                                </label>
                                <select
                                    id="taskGroup"
                                    name="taskGroup"
                                    value={isCreatingNewGroup ? -1 : newTask.taskGroup}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded-lg bg-background-secondary border border-accent focus:outline-none focus:border-accent"
                                >
                                    <option value={-1}>Criar novo grupo</option>
                                    {availableGroups.map((group) => (
                                        <option key={group.taskGroupId} value={group.taskGroupId}>
                                            {group.taskGroupName}
                                        </option>
                                    ))}
                                </select>
                                
                                {isCreatingNewGroup && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            placeholder="Nome do novo grupo"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            className="w-full p-2 rounded-lg bg-background-secondary border border-accent focus:outline-none focus:border-accent"
                                            required={isCreatingNewGroup}
                                        />
                                    </div>
                                )}
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