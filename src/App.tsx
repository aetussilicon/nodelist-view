import './App.css'
import {ChevronDown, Dot, Flag, Hexagon, Pencil, Plus, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import axios from "axios";

function App() {

    interface TaskGroupProps {
        taskGroupId: number;
        taskGroupName: string;
        createdAt: string;
        updatedAt: string;
    }

    interface TaskProps {
        taskId: number;
        title: string;
        description: string;
        priority: string;
        taskGroup: TaskGroupProps;
        createdAt: string;
        updatedAt: string;
    }

    const [tasks, setTasks] = useState<TaskProps[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
    const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({});
    const [openPriorityMenu, setOpenPriorityMenu] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [taskGroups, setTaskGroups] = useState<TaskGroupProps[]>([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'P5',
        taskGroupId: 0
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editingTask, setEditingTask] = useState<TaskProps | null>(null);

    const priorityMenuRef = useRef<HTMLDivElement>(null);

    const priorityOptions = [
        {value: "P1", label: "Urgente", color: "#FF0000"},
        {value: "P2", label: "Prioridade", color: "#FFA500"},
        {value: "P3", label: "Média", color: "#FFFF00"},
        {value: "P4", label: "Baixa", color: "#00FF00"},
        {value: "P5", label: "Sem prioridade", color: "#808080"}
    ];

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get("http://localhost:8081/tasks");
                if (res.status === 200) {
                    setTasks(res.data);

                    // Inicializa todos os grupos como expandidos
                    const groups: Record<number, boolean> = {};
                    res.data.forEach((task: TaskProps) => {
                        groups[task.taskGroup.taskGroupId] = true;
                    });
                    setExpandedGroups(groups);

                    // Extrair os grupos únicos das tarefas
                    const uniqueGroups = Array.from(
                        new Map(res.data.map((task: TaskProps) => [task.taskGroup.taskGroupId, task.taskGroup])).values()
                    );
                    setTaskGroups(uniqueGroups as TaskGroupProps[]);

                    // Inicializar o grupo padrão para novas tarefas se existirem grupos
                    if (uniqueGroups.length > 0) {
                        setNewTask(prev => ({
                            ...prev,
                            taskGroupId: (uniqueGroups[0] as TaskGroupProps).taskGroupId
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching tasks:", err);
                throw err;
            }
        };

        fetchTasks();

        const handleClickOutside = (event: MouseEvent) => {
            if (priorityMenuRef.current && !priorityMenuRef.current.contains(event.target as Node)) {
                setOpenPriorityMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleGroupExpansion = (groupId: number) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const toggleTaskExpansion = (taskId: number) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const togglePriorityMenu = (taskId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenPriorityMenu(openPriorityMenu === taskId ? null : taskId);
    };

    const updateTaskPriority = async (taskId: number, priority: string) => {
        try {
            const taskToUpdate = tasks.find(task => task.taskId === taskId);
            if (!taskToUpdate) return;

            const res = await axios.put(`http://localhost:8081/tasks/update/${taskId}`, {
                ...taskToUpdate,
                priority
            });

            if (res.status === 200) {
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.taskId === taskId ? {...task, priority} : task
                    )
                );
            }

            // Fechar o menu após a seleção
            setOpenPriorityMenu(null);
        } catch (err) {
            console.error("Erro ao atualizar a prioridade:", err);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8081/tasks/create", newTask);
            if (res.status === 201) {
                // Recarregar as tarefas para obter a lista atualizada
                const tasksRes = await axios.get("http://localhost:8081/tasks");
                if (tasksRes.status === 200) {
                    setTasks(tasksRes.data);
                }
                // Limpar o formulário e fechar o modal
                setNewTask({
                    title: '',
                    description: '',
                    priority: 'P5',
                    taskGroupId: taskGroups.length > 0 ? taskGroups[0].taskGroupId : 0
                });
                setIsCreateModalOpen(false);
            }
        } catch (err) {
            console.error("Erro ao criar tarefa:", err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setNewTask(prev => ({
            ...prev,
            [name]: name === 'taskGroupId' ? parseInt(value, 10) : value
        }));
    };

    const openEditModal = (task: TaskProps, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTask({...task}); // Criar uma cópia da tarefa para edição
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        if (editingTask) {
            setEditingTask(prev => ({
                ...prev!,
                [name]: value
            }));
        }
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;

        try {
            const res = await axios.put(`http://localhost:8081/tasks/update/${editingTask.taskId}`, {
                ...editingTask,
                taskGroup: undefined // Remover taskGroup para evitar problemas na API
            });

            if (res.status === 200) {
                // Atualizar a lista de tarefas
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.taskId === editingTask.taskId ? {...task, ...editingTask} : task
                    )
                );
                // Fechar o modal
                setIsEditModalOpen(false);
                setEditingTask(null);
            }
        } catch (err) {
            console.error("Erro ao atualizar tarefa:", err);
        }
    };

    // Função para obter a cor da flag com base na prioridade
    const getFlagColor = (priority: string) => {
        const option = priorityOptions.find(opt => opt.value === priority);
        return option ? option.color : "#808080"; // Cinza como padrão
    };

    console.log(tasks);

    return (
        <div className="bg-background text-text-primary">
            <div className="xs:mx-[10%] flex flex-col items-center min-h-screen gap-4 py-4">
                <div className="flex items-center justify-between w-full max-w-md">
                    <div className="flex items-center gap-2">
                        <Hexagon size={48}/>
                        <h1 className="text-xl font-bold">NodeList</h1>
                    </div>
                    <button
                        className="bg-accent hover:bg-accent/80 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus size={20}/>
                        Nova Tarefa
                    </button>
                </div>

                {Object.values(
                    tasks.reduce((groups, task) => {
                        if (!groups[task.taskGroup.taskGroupId]) {
                            groups[task.taskGroup.taskGroupId] = {
                                groupInfo: task.taskGroup,
                                tasks: []
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
                                className={`font-bold transition-transform duration-200 ${
                                    expandedGroups[group.groupInfo.taskGroupId] ? '' : 'transform rotate-180'
                                }`}
                            />
                        </div>

                        {expandedGroups[group.groupInfo.taskGroupId] && (
                            <div className="bg-background-secondary p-3 rounded-lg shadow-lg">
                                {group.tasks.map((task) => (
                                    <div className="bg-background rounded-lg p-4 w-full flex flex-col gap-2 mb-2"
                                         key={task.taskId}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox"/>
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
                                                            {priorityOptions.map((option) => (
                                                                <div
                                                                    key={option.value}
                                                                    className="flex items-center gap-2 px-4 py-2 hover:bg-accent cursor-pointer"
                                                                    onClick={() => updateTaskPriority(task.taskId, option.value)}
                                                                >
                                                                    <Flag size={16} color={option.color}/>
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
                                                    className={`cursor-pointer transition-transform duration-200 ${
                                                        expandedTasks[task.taskId] ? 'transform rotate-180' : ''
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleTaskExpansion(task.taskId);
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <p className="text-sm mt-1">
                                            {!expandedTasks[task.taskId]
                                                ? `${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}`
                                                : task.description
                                            }
                                        </p>

                                        <div className="w-full flex flex-col gap-2">
                                            <div className="h-[0.15rem] bg-gray-600 w-full"/>
                                            <div className="flex gap-1 items-center">
                                                <p className="text-[12px]">Criado: {task.createdAt}</p>
                                                <Dot size={12} color={'white'}/>
                                                <p className="text-[12px]">Atualizado: {task.updatedAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Modal para criar nova tarefa */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-background p-6 rounded-lg w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Nova Tarefa</h2>
                                <button
                                    className="text-text-primary hover:text-accent"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    <X size={24}/>
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
                                        {taskGroups.map(group => (
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
                                        {priorityOptions.map(option => (
                                            <div
                                                key={option.value}
                                                className={`flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer ${
                                                    newTask.priority === option.value
                                                        ? 'bg-accent'
                                                        : 'bg-background-secondary hover:bg-accent/20'
                                                }`}
                                                onClick={() => setNewTask(prev => ({...prev, priority: option.value}))}
                                            >
                                                <Flag size={16} color={option.color}/>
                                                <span>{option.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="bg-background-secondary hover:bg-accent/20 text-text-primary px-4 py-2 rounded-lg mr-2"
                                        onClick={() => setIsCreateModalOpen(false)}
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

                {/* Modal para editar tarefa */}
                {isEditModalOpen && editingTask && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-background p-6 rounded-lg w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Editar Tarefa</h2>
                                <button
                                    className="text-text-primary hover:text-accent"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingTask(null);
                                    }}
                                >
                                    <X size={24}/>
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
                                        {priorityOptions.map(option => (
                                            <div
                                                key={option.value}
                                                className={`flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer ${
                                                    editingTask.priority === option.value
                                                        ? 'bg-accent'
                                                        : 'bg-background-secondary hover:bg-accent/20'
                                                }`}
                                                onClick={() => setEditingTask(prev => ({...prev!, priority: option.value}))}
                                            >
                                                <Flag size={16} color={option.color}/>
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
                                            setIsEditModalOpen(false);
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
                )}
            </div>
        </div>
    )
}

export default App
