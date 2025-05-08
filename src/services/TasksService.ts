import type {AxiosInstance} from "axios";

export class TasksService {
    private http: AxiosInstance;

    constructor(http: AxiosInstance) {
        this.http = http;
    }

    async getTasks() {
        const res = await this.http.get("/tasks")
        return res.data;
    }

    async changePriority(taskId: number, priority: string) {
        const res = await this.http.patch(`/tasks/${taskId}`, {priority})
        return res.data;
    }
}