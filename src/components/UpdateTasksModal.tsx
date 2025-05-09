import React, { useEffect, useState } from "react";
import { PriorityOptions, type PriorityOption } from "../consts/PriorityOptions";
import type { NewTaskProps } from "../interfaces/NewTaskProps";
import type { TaskProps } from "../interfaces/TaskProps";
import type { TaskGroupProps } from "../interfaces/TasksGroupProps";
import api from "../Api";
import { TasksService } from "../services/TasksService";
import { TasksGroupsService } from "../services/TasksGroupsService";
import { Flag, X } from "lucide-react";

interface UpdateTaskModalProps {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setEditingTask: React.Dispatch<React.SetStateAction<TaskProps | null>>;
    editingTask: TaskProps | null;
    setTasks: React.Dispatch<React.SetStateAction<TaskProps[]>>;
}

const UpdateTaskModal: React.FC<UpdateTaskModalProps> = ({ setIsOpen, setEditingTask, editingTask, setTasks }) => {
    const [availableGroups, setAvailableGroups] = useState<TaskGroupProps[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<number>(0);
    const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState<string>("");

    const tasksService = new TasksService(api);
    const tasksGroupsService = new TasksGroupsService(api);

    // Buscar grupos disponíveis ao carregar o modal
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const groups = await tasksGroupsService.getGroups();
                setAvailableGroups(groups);
                
                // Define o grupo atual da tarefa como selecionado por padrão
                if (editingTask) {
                    setSelectedGroupId(editingTask.taskGroup.taskGroupId);
                }
            } catch (err) {
                console.error("Erro ao buscar grupos:", err);
            }
        };
        
        fetchGroups();
    }, [editingTask]);

    const getPriorityValueFromLabel = (label: string): PriorityOption => {
        const option = PriorityOptions.find((opt) => opt.label === label);
        return option ? option.value : "P5"; // Retorna "P5" como padrão se não encontrado
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;

        try {
            let finalGroupId = selectedGroupId;
            
            // Se está criando um novo grupo, primeiro cria o grupo
            if (isCreatingNewGroup && newGroupName.trim()) {
                const newGroup = await tasksGroupsService.createTaskGroup(newGroupName);
                finalGroupId = newGroup.taskGroupId;
            }

            const payload: NewTaskProps = {
                title: editingTask.title,
                description: editingTask.description,
                priority: getPriorityValueFromLabel(editingTask.priority),
                taskGroup: finalGroupId, // Usa o grupo selecionado ou o novo grupo criado
            };

            const updatedTask = await tasksService.updateTask(editingTask.taskId, payload);

            // Atualizar a lista de tarefas e buscar todas novamente para ter os grupos atualizados
            const tasksRes = await tasksService.getTasks();
            setTasks(tasksRes);

            // Fechar o modal
            setIsOpen(false);
            setEditingTask(null);
            window.location.reload();
        } catch (err) {
            console.error("Erro ao atualizar tarefa:", err);
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (editingTask) {
            if (name === "taskGroup") {
                const parsedValue = parseInt(value, 10);
                // Se o valor for -1, o usuário selecionou "Criar novo grupo"
                if (parsedValue === -1) {
                    setIsCreatingNewGroup(true);
                } else {
                    setIsCreatingNewGroup(false);
                    setSelectedGroupId(parsedValue);
                }
            } else {
                setEditingTask(prev => prev ? ({
                    ...prev,
                    [name]: value,
                }) : null);
            }
        }
    };

    if (!editingTask) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Editar Tarefa</h2>
                    <button
                        className="text-text-primary hover:text-accent"
                        onClick={() => {
                            setIsOpen(false);
                            setEditingTask(null);
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdateTask}>
                    <div className="mb-4">
                        <label htmlFor="edit-title" className="block text-sm font-medium mb-2">
                            Título
                        </label>
                        <input
                            type="text"
                            id="edit-title"
                            name="title"
                            value={editingTask.title}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded-lg bg-background-secondary border border-accent focus:outline-none focus:border-accent"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="edit-description" className="block text-sm font-medium mb-2">
                            Descrição
                        </label>
                        <textarea
                            id="edit-description"
                            name="description"
                            value={editingTask.description}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded-lg bg-background-secondary border border-accent focus:outline-none focus:border-accent"
                            rows={4}
                        />
                    </div>

                    {/* Adicionar seletor de grupo com opção de criar novo */}
                    <div className="mb-4">
                        <label htmlFor="edit-group" className="block text-sm font-medium mb-2">
                            Grupo
                        </label>
                        <select
                            id="edit-group"
                            name="taskGroup"
                            value={isCreatingNewGroup ? -1 : selectedGroupId}
                            onChange={handleEditChange}
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
                        <label htmlFor="edit-priority" className="block text-sm font-medium mb-2">
                            Prioridade
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {PriorityOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer ${editingTask.priority === option.value
                                        ? "bg-accent"
                                        : "bg-background-secondary hover:bg-accent/20"
                                    }`}
                                    onClick={() =>
                                        setEditingTask(prev => prev ? ({
                                            ...prev,
                                            priority: option.value,
                                        }) : null)
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
                            onClick={() => {
                                setIsOpen(false);
                                setEditingTask(null);
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateTaskModal;