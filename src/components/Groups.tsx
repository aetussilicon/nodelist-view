import { ChevronDown } from "lucide-react";
import type { TaskGroupProps } from "../interfaces/TasksGroupProps";
import TaskCard from "./TaskCard";
import { useEffect, useState } from "react";
import api from "../Api";
import { TasksGroupsService } from "../services/TasksGroupsService";

const Groups = () => {
    const groupsService = new TasksGroupsService(api);
    const [taskGroups, setTaskGroups] = useState<TaskGroupProps[]>([]);
    const [groupsNames, setGroupsNames] = useState<Record<number, string>>({});
    // Modificando para usar um Set para rastrear múltiplos grupos expandidos
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
    
    useEffect(() => {
        const fetchGroupsList = async () => {
            const res = await groupsService.getGroupNames();
            setGroupsNames(res);
            console.log("Groups: ", res); 
        };

        fetchGroupsList();
    
    }, []);

    useEffect(() => {
        const fetchGroups = async () => {
            const res = await groupsService.getGroups();
            setTaskGroups(res);
            console.log("Task Groups: ", res); 
        };

        fetchGroups();
    }, [])
    
    // Efeito para inicializar todos os grupos como expandidos após carregar os dados
    useEffect(() => {
        if (taskGroups.length > 0) {
            const allGroupIds = new Set(taskGroups.map(group => group.taskGroupId));
            setExpandedGroups(allGroupIds);
        }
    }, []);

    const toggleGroup = (groupId: number) => {
        setExpandedGroups(prevExpanded => {
            const newExpanded = new Set(prevExpanded);
            if (newExpanded.has(groupId)) {
                newExpanded.delete(groupId);
            } else {
                newExpanded.add(groupId);
            }
            return newExpanded;
        });
    };

    return (
        <>
            {taskGroups.map((group) => (
                group.tasks.length != 0 && (
                    <div key={group.taskGroupId}>
                        <div className="bg-accent text-white p-2 rounded-lg mb-4 font-bold flex items-center justify-between">
                            <h1>{group.taskGroupName}</h1>
                            <button type="button" onClick={() => toggleGroup(group.taskGroupId)} >
                                <ChevronDown />
                            </button>
                        </div>
                        {expandedGroups.has(group.taskGroupId) && (
                            <div className="bg-background-secondary text-text-primary p-2 rounded-lg">
                                {group.tasks.map((task) => (
                                    <div key={task.taskId} className="mb-2">
                                        <TaskCard
                                            task={task} />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                    </div>  
                )
            ))}
        </>
    );
};

export default Groups;