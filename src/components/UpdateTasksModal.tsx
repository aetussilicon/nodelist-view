import React from "react";
import { PriorityOptions, type PriorityOption } from "../consts/PriorityOptions";
import type { NewTaskProps } from "../interfaces/NewTaskProps";
import type { TaskProps } from "../interfaces/TaskProps";
import api from "../Api";
import { TasksService } from "../services/TasksService";
import { Flag, X } from "lucide-react";

interface UpdateTaskModalProps {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setEditingTask: React.Dispatch<React.SetStateAction<TaskProps | null>>;
    editingTask: TaskProps | null;
    setTasks: React.Dispatch<React.SetStateAction<TaskProps[]>>;
}

const UpdateTaskModal: React.FC<UpdateTaskModalProps> = ({ setIsOpen, setEditingTask, editingTask, setTasks }) => {

    const tasksService = new TasksService(api);

    const getPriorityValueFromLabel = (label: string): PriorityOption => {
        const option = PriorityOptions.find((opt) => opt.label === label);
        return option ? option.value : "P5"; // Retorna "P5" como padrão se não encontrado
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;

        try {
            const payload: NewTaskProps = {
                title: editingTask.title,
                description: editingTask.description,
                priority: getPriorityValueFromLabel(editingTask.priority),
                taskGroup: editingTask.taskGroup.taskGroupId,
            };

            const updatedTask = await tasksService.updateTask(editingTask.taskId, payload);

            // Atualizar a lista de tarefas
            setTasks(prev =>
                prev.map(t => (t.taskId === updatedTask.taskId ? updatedTask : t))
            );

            // Fechar o modal
            setIsOpen(false);
            setEditingTask(null);
        } catch (err) {
            console.error("Erro ao atualizar tarefa:", err);
        }
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (editingTask) {
            setEditingTask(prev => prev ? ({
                ...prev,
                [name]: name === "taskGroup" ? prev.taskGroup : value,
            }) : null);
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
                            required
                        />
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