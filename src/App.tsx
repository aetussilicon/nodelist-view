import "./App.css";
import { ChevronDown, Dot, Flag, Hexagon, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TaskGroupProps } from "./interfaces/TasksGroupProps.ts";
import type { TaskProps } from "./interfaces/TaskProps.ts";
import { PriorityOptions } from "./consts/PriorityOptions.ts";
import { TasksService } from "./services/TasksService.ts";
import api from "./Api.ts";
import CreateTaskModal from "./components/CreateTaskModal.tsx";
import UpdateTaskModal from "./components/UpdateTasksModal.tsx";

function App() {
    const [tasks, setTasks] = useState<TaskProps[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
    const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});
    const [openPriorityMenu, setOpenPriorityMenu] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [taskGroups, setTaskGroups] = useState<TaskGroupProps[]>([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editingTask, setEditingTask] = useState<TaskProps | null>(null);

    const priorityMenuRef = useRef<HTMLDivElement>(null);

    const tasksService = new TasksService(api);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await tasksService.getTasks();
                if (!data) return;

                setTasks(data);

                // Inicializa todos os grupos como expandidos
                const groups: Record<number, boolean> = {};
                data.forEach((task: TaskProps) => {
                    groups[task.taskGroup.taskGroupId] = true;
                });
                setExpandedGroups(groups);

                // Extrair os grupos únicos das tarefas
                const uniqueGroups = Array.from(
                    new Map(data.map((task: TaskProps) => [task.taskGroup.taskGroupId, task.taskGroup])).values()
                );
                setTaskGroups(uniqueGroups as TaskGroupProps[]);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            }
        };

        fetchTasks();

        const handleClickOutside = (event: MouseEvent) => {
            if (priorityMenuRef.current && !priorityMenuRef.current.contains(event.target as Node)) {
                setOpenPriorityMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleGroupExpansion = (groupId: number) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    const toggleTaskExpansion = (taskId: number) => {
        setExpandedTasks((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    const togglePriorityMenu = (taskId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenPriorityMenu(openPriorityMenu === taskId ? null : taskId);
    };

    const updateTaskPriority = async (taskId: number, priority: string) => {
        try {
            const res = await tasksService.changePriority(taskId, priority);
            if (res) {
                setTasks((prevTasks) =>
                    prevTasks.map((task) => (task.taskId === taskId ? { ...task, priority } : task))
                );
            }

            setOpenPriorityMenu(null);
        } catch (err) {
            console.error("Erro ao atualizar a prioridade:", err);
        }
    };

    const openEditModal = (task: TaskProps, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTask({ ...task }); // Criar uma cópia da tarefa para edição
        setIsEditModalOpen(true);
    };

    // Função para obter a cor da flag com base na prioridade
    const getFlagColor = (priority: string) => {
        const option = PriorityOptions.find((opt) => opt.label === priority);
        return option ? option.color : "#808080"; // Cinza como padrão
    };

    console.log(tasks);

    return (
        <>
            <div className="bg-background text-text-primary">
                <div className="xs:mx-[10%] flex flex-col items-center min-h-screen gap-4 py-4">
                    <div className="flex items-center justify-between w-full max-w-md">
                        <div className="flex items-center gap-2">
                            <Hexagon size={48} />
                            <h1 className="text-xl font-bold">NodeList</h1>
                        </div>
                        <CreateTaskModal isOpen={isCreateModalOpen} setIsOpen={setIsCreateModalOpen} setTasks={setTasks} tasksGroups={taskGroups} />
                    </div>

                    {Object.values(
                        tasks.reduce((groups, task) => {
                            if (!groups[task.taskGroup.taskGroupId]) {
                                groups[task.taskGroup.taskGroupId] = {
                                    groupInfo: task.taskGroup,
                                    tasks: [],
                                };
                            }
                            // Adiciona a tarefa ao grupo
                            groups[task.taskGroup.taskGroupId].tasks.push(task);
                            return groups;
                        }, {} as Record<number, { groupInfo: TaskGroupProps; tasks: TaskProps[] }>)
                    ).map((group) => (
                        <div key={group.groupInfo.taskGroupId} className="w-full max-w-md">
                            <div
                                className="bg-accent rounded-lg p-1 flex items-center justify-between mb-2 cursor-pointer"
                                onClick={() => toggleGroupExpansion(group.groupInfo.taskGroupId)}
                            >
                                <h2 className="text-lg font-semibold">{group.groupInfo.taskGroupName}</h2>
                                <ChevronDown
                                    className={`font-bold transition-transform duration-200 ${expandedGroups[group.groupInfo.taskGroupId] ? "" : "transform rotate-180"
                                    }`}
                                />
                            </div>

                            {expandedGroups[group.groupInfo.taskGroupId] && (
                                <div className="bg-background-secondary p-3 rounded-lg shadow-lg">
                                    {group.tasks.map((task) => (
                                        <div
                                            className="bg-background rounded-lg p-4 w-full flex flex-col gap-2 mb-2"
                                            key={task.taskId}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <input type="checkbox" />
                                                    <h1 className="text-xl font-bold">{task.title}</h1>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <Flag
                                                            color={getFlagColor(task.priority)}
                                                            className="cursor-pointer hover:opacity-80"
                                                            onClick={(e) => togglePriorityMenu(task.taskId, e)}
                                                        />

                                                        {openPriorityMenu === task.taskId && (
                                                            <div
                                                                ref={priorityMenuRef}
                                                                className="absolute right-0 mt-1 w-40 bg-background-secondary rounded-lg shadow-lg z-10 py-1"
                                                            >
                                                                {PriorityOptions.map((option) => (
                                                                    <div
                                                                        key={option.value}
                                                                        className="flex items-center gap-2 px-4 py-2 hover:bg-accent cursor-pointer"
                                                                        onClick={() =>
                                                                            updateTaskPriority(
                                                                                task.taskId,
                                                                                option.value
                                                                            )
                                                                        }
                                                                    >
                                                                        <Flag size={16} color={option.color} />
                                                                        <span>{option.label}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Pencil
                                                        size={18}
                                                        className="cursor-pointer hover:text-accent"
                                                        onClick={(e) => openEditModal(task, e)}
                                                    />
                                                    <ChevronDown
                                                        className={`cursor-pointer transition-transform duration-200 ${expandedTasks[task.taskId] ? "transform rotate-180" : ""
                                                        }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTaskExpansion(task.taskId);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {task.description != null && (
                                                <p className="text-sm mt-1">
                                                    {!expandedTasks[task.taskId]
                                                        ? `${task.description.substring(0, 50)}${task.description.length > 50 ? "..." : ""
                                                        }`
                                                        : task.description}
                                                </p>
                                            )}

                                            <div className="w-full flex flex-col gap-2">
                                                <div className="h-[0.15rem] bg-gray-600 w-full" />
                                                <div className="flex gap-1 items-center">
                                                    <p className="text-[12px]">Criado: {task.createdAt}</p>
                                                    <Dot size={12} color={"white"} />
                                                    <p className="text-[12px]">Atualizado: {task.updatedAt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Modal para editar tarefa */}
                    {isEditModalOpen && editingTask && (
                        <UpdateTaskModal editingTask={editingTask} setEditingTask={setEditingTask} setIsOpen={setIsEditModalOpen} setTasks={setTasks} />
                    )}
                </div>
            </div>
        </>
    );
}

export default App;
