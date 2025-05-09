import type { AxiosInstance } from "axios";
import api from "../Api";
import type { NewTaskProps } from "../interfaces/NewTaskProps";
import type { TaskProps } from "../interfaces/TaskProps";

export class TasksService {
    private http: AxiosInstance;

    constructor(http: AxiosInstance) {
        this.http = http;
    }

    async getTasks() {
        const res = await this.http.get("/tasks");
        return res.data;
    }

    async changePriority(taskId: number, priority: string) {
        const res = await this.http.patch(`/tasks/priority/${taskId}?priority=${priority}`);
        return res.data;
    }

    async createTask(task: NewTaskProps): Promise<TaskProps> {
        try {
            const res = await api.post("/tasks/create", task);
            return res.data;
            
        } catch (err) {
            console.log("Error while creating task: ", err);
            throw err;
        }
    }

    async updateTask(taskId: number, task: NewTaskProps): Promise<TaskProps> {
        try {
            const res = await api.patch(`/tasks/update/${taskId}`, task);
            return res.data;
        } catch (err) {
            console.log("Error while updating task: ", err);
            throw err;
        }
    }

    async markTaskAsCompleted(taskId: number): Promise<TaskProps> {
        try {
            const res = await api.patch(`/tasks/complete/${taskId}`);
            return res.data;
        } catch (err) {
            console.log("Error while marking task as completed: ", err);
            throw err;
        }
    }
}
