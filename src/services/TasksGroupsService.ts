import type { AxiosInstance } from "axios";
import type { TaskGroupProps } from "../interfaces/TasksGroupProps";

export class TasksGroupsService {
    private http: AxiosInstance;

    constructor(http: AxiosInstance) {
        this.http = http;
    }

    async createTaskGroup(taskGroupName: string): Promise<TaskGroupProps> {
        try {
            const res = await this.http.post("/groups/create", {
                taskGroupName: taskGroupName,
            });
            return res.data;
        
        } catch (err) {
            console.log("Error while creating task group: ", err);
            throw err;
        }
    }

    async getGroups(): Promise<TaskGroupProps[]> {
        try {
            const res = await this.http.get("/groups");
            return res.data;
        } catch (err) {
            console.log("Error while getting task groups: ", err);
            throw err;
        }
    }

    async getGroupNames(): Promise<Record<number, string>> {
        try {
            const res = await this.http.get("/groups/names");
            return res.data;
        } catch (err) {
            console.log("Error while getting task groups names: ", err);
            throw err;
        }
    }
}