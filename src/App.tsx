import './App.css';
import { ChevronDown, Dot, Flag, Hexagon, Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { TaskGroupProps } from './interfaces/TasksGroupProps.ts';
import type { TaskProps } from './interfaces/TaskProps.ts';
import { PriorityOptions } from './consts/PriorityOptions.ts';
import { TasksService } from './services/TasksService.ts';
import { TasksGroupsService } from './services/TasksGroupsService.ts';
import api from './Api.ts';
import CreateTaskModal from './components/CreateTaskModal.tsx';
import UpdateTaskModal from './components/UpdateTasksModal.tsx';
import { useTaskWebSocket } from './hooks/useTaskWebSocket.ts';
import Groups from './components/Groups.tsx';

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
    const tasksGroupsService = new TasksGroupsService(api);

    useTaskWebSocket((updatedTask: TaskProps) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) => (task.taskId === updatedTask.taskId ? updatedTask : task))
        ); 
    });

    useEffect(() => {
        const fetchTasksAndGroups = async () => {
            try {
                // Buscar grupos e tarefas paralelamente
                const [tasksData, groupsData] = await Promise.all([
                    tasksService.getTasks(),
                    tasksGroupsService.getGroups(),
                ]);

                if (tasksData) {
                    setTasks(tasksData);
                }

                if (groupsData) {
                    setTaskGroups(groupsData);

                    // Inicializa todos os grupos como expandidos
                    const groups: Record<number, boolean> = {};
                    groupsData.forEach((group: TaskGroupProps) => {
                        groups[group.taskGroupId] = true;
                    });
                    setExpandedGroups(groups);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };

        fetchTasksAndGroups();

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
            await tasksService.changePriority(taskId, priority);
            setOpenPriorityMenu(null);
        } catch (err) {
            console.error('Erro ao atualizar a prioridade:', err);
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
        return option ? option.color : '#808080'; // Cinza como padrão
    };

    const markAsCompleted = async (taskId: number) => {
        try {
            const res = await tasksService.markTaskAsCompleted(taskId);
            if (res) {
                // Atualizar a lista de tarefas após marcar como concluído
                const updatedTasks = await tasksService.getTasks();
                setTasks(updatedTasks);
            }
        } catch (err) {
            console.error('Erro ao marcar como concluído:', err);
        }
    };

    console.log(tasks);

    return (
        <>
            <div className='bg-background text-text-primary'>
                <div className='xs:mx-[5%] flex flex-col items-center min-h-screen gap-4 py-4'>
                    <div className='flex items-center justify-between w-full max-w-screen-xl'>
                        <div className='flex items-center gap-2'>
                            <Hexagon size={48} />
                            <h1 className='text-xl font-bold'>NodeList</h1>
                        </div>
                        <CreateTaskModal
                            isOpen={isCreateModalOpen}
                            setIsOpen={setIsCreateModalOpen}
                            setTasks={setTasks}
                            availableGroups={taskGroups}
                        />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-screen-xl'>
                        <Groups />
                        {/* {taskGroups
                            .filter((group) => {
                                // Só mostra grupos que contêm pelo menos uma tarefa
                                return tasks.some((task) => task.taskGroup.taskGroupId === group.taskGroupId);
                            })
                            .sort((a, b) => {
                                if (a.taskGroupName === "Concluído") return 1;
                                if (b.taskGroupName === "Concluído") return -1;
                                return a.taskGroupId - b.taskGroupId;
                            })
                            .map((group) => {
                                // Filtrar tarefas para este grupo
                                const groupTasks = tasks.filter(
                                    (task) => task.taskGroup.taskGroupId === group.taskGroupId
                                );

                                return (
                                    <div key={group.taskGroupId} className='w-full'>
                                        <div
                                            className='bg-accent rounded-lg p-1 flex items-center justify-between mb-2 cursor-pointer'
                                            onClick={() => toggleGroupExpansion(group.taskGroupId)}
                                        >
                                            <h2 className='text-lg font-semibold'>{group.taskGroupName}</h2>
                                            <ChevronDown
                                                className={`font-bold transition-transform duration-200 ${
                                                    expandedGroups[group.taskGroupId] ? '' : 'transform rotate-180'
                                                }`}
                                            />
                                        </div>

                                        {expandedGroups[group.taskGroupId] && (
                                            <div className='bg-background-secondary p-3 rounded-lg shadow-lg'>
                                                {groupTasks.map((task) => (
                                                    <div
                                                        className='bg-background rounded-lg p-4 w-full flex flex-col gap-2 mb-2'
                                                        key={task.taskId}
                                                    >
                                                        <div className='flex justify-between items-center'>
                                                            <div className='flex flex-col'>
                                                                <div className='flex items-center gap-2'>
                                                                    <input
                                                                        type='checkbox'
                                                                        checked={task.completed}
                                                                        onChange={() => markAsCompleted(task.taskId)}
                                                                    />
                                                                    <h1
                                                                        className={`text-xl font-bold ${
                                                                            task.completed ? 'line-through italic' : ''
                                                                        }`}
                                                                    >
                                                                        {task.title}
                                                                    </h1>
                                                                </div>
                                                                {task.completed ? (
                                                                    <p className='text-sm'>
                                                                        Concluída: {task.completedAt}
                                                                    </p>
                                                                ) : (
                                                                    ''
                                                                )}
                                                            </div>

                                                            <div className='flex items-center gap-2'>
                                                                <div className='relative'>
                                                                    <Flag
                                                                        color={getFlagColor(task.priority)}
                                                                        className='cursor-pointer hover:opacity-80'
                                                                        onClick={(e) =>
                                                                            togglePriorityMenu(task.taskId, e)
                                                                        }
                                                                    />

                                                                    {openPriorityMenu === task.taskId && (
                                                                        <div
                                                                            ref={priorityMenuRef}
                                                                            className='absolute right-0 mt-1 w-40 bg-background-secondary rounded-lg shadow-lg z-10 py-1'
                                                                        >
                                                                            {PriorityOptions.map((option) => (
                                                                                <div
                                                                                    key={option.value}
                                                                                    className='flex items-center gap-2 px-4 py-2 hover:bg-accent cursor-pointer'
                                                                                    onClick={() =>
                                                                                        updateTaskPriority(
                                                                                            task.taskId,
                                                                                            option.value // Passamos o value, não o label
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <Flag
                                                                                        size={16}
                                                                                        color={option.color}
                                                                                    />
                                                                                    <span>{option.label}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Pencil
                                                                    size={18}
                                                                    className='cursor-pointer hover:text-accent'
                                                                    onClick={(e) => openEditModal(task, e)}
                                                                />

                                                                {task.description && task.description.length > 50 && (
                                                                    <ChevronDown
                                                                        className={`cursor-pointer transition-transform duration-200 ${
                                                                            expandedTasks[task.taskId]
                                                                                ? 'transform rotate-180'
                                                                                : ''
                                                                        }`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleTaskExpansion(task.taskId);
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {task.description != null && (
                                                            <p className='text-sm mt-1'>
                                                                {!expandedTasks[task.taskId]
                                                                    ? `${task.description.substring(0, 50)}${
                                                                          task.description.length > 50 ? '...' : ''
                                                                      }`
                                                                    : task.description}
                                                            </p>
                                                        )}

                                                        <div className='w-full flex flex-col gap-2'>
                                                            <div className='h-[0.15rem] bg-gray-600 w-full' />
                                                            <div className='flex gap-1 items-center'>
                                                                <p className='text-[12px]'>Criado: {task.createdAt}</p>
                                                                <Dot size={12} color={'white'} />
                                                                <p className='text-[12px]'>
                                                                    Atualizado: {task.updatedAt}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })} */}
                    </div>

                    {isEditModalOpen && editingTask && (
                        <UpdateTaskModal
                            editingTask={editingTask}
                            setEditingTask={setEditingTask}
                            setIsOpen={setIsEditModalOpen}
                            setTasks={setTasks}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default App;
