import './App.css'
import {Hexagon} from "lucide-react";
import {useEffect, useState} from "react";
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

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await axios.get("http://localhost:8081/tasks");
                if (res.status === 200) {
                    setTasks(res.data);
                }
            } catch (err) {
                console.error("Error fetching tasks:", err);
                throw err;
            }
        }

        fetchTasks();
    }, []);

    console.log(tasks);


    return (
        <div className="xs:mx-[10%] flex flex-col items-center h-screen gap-4 py-4">
            <div className="flex items-center gap-2">
                <Hexagon size={48}/>
                <h1 className="text-xl font-bold">NodeList</h1>
            </div>
            <h1>Hello, world</h1>
        </div>
    )
}

export default App
