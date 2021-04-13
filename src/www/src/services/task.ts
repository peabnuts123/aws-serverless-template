import Endpoints from "@app/constants/endpoints";
import Project from "@app/models/Project";
import Task, { TaskDto } from "@app/models/Task";
import { loggedApiRequest } from "@app/util/logged-api-request";

import Api from "./api";

interface CreateTaskDto {
  description: string;
}

class TaskService {
  public async create(project: Project, dto: CreateTaskDto): Promise<Task> {
    return loggedApiRequest(async () => {
      const result = await Api.postJson<TaskDto>(Endpoints.Task.create(project.id), { body: dto });
      return new Task(result);
    });
  }

  public async delete(project: Project, task: Task): Promise<Task> {
    return loggedApiRequest(async () => {
      const result = await Api.delete<TaskDto>(Endpoints.Task.delete(project.id, task.id));
      return new Task(result);
    });
  }

  public async getById(project: Project, taskId: string): Promise<Task> {
    return loggedApiRequest(async () => {
      const result = await Api.get<TaskDto>(Endpoints.Task.getById(project.id, taskId));
      return new Task(result);
    });
  }

  public async getAll(project: Project): Promise<Task[]> {
    return loggedApiRequest(async () => {
      const result = await Api.get<TaskDto[]>(Endpoints.Task.getAll(project.id));
      return result.map((taskDto) => new Task(taskDto));
    });
  }

  public async save(project: Project, task: Task): Promise<Task> {
    return loggedApiRequest(async () => {
      const result = await Api.putJson<TaskDto>(Endpoints.Task.save(project.id, task.id), { body: task.toDto() });
      return new Task(result);
    });
  }
}

export default new TaskService();
