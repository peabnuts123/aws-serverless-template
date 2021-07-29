import Endpoints from "@app/constants/endpoints";
import Project, { ProjectDto } from "@app/models/Project";
import { loggedApiRequest } from "@app/util/logged-api-request";

import Api from "./api";

interface CreateProjectDto {
  name: string;
}

class ProjectService {
  public async create(dto: CreateProjectDto): Promise<Project> {
    return loggedApiRequest(async () => {
      const result = await Api.postJson<ProjectDto>(Endpoints.Project.create(), { body: dto });
      return new Project(result);
    });
  }

  public async delete(project: Project): Promise<Project> {
    return loggedApiRequest(async () => {
      const result = await Api.delete<ProjectDto>(Endpoints.Project.delete(project.id));
      return new Project(result);
    });
  }

  public async getById(projectId: string): Promise<Project> {
    return loggedApiRequest(async () => {
      const result = await Api.get<ProjectDto>(Endpoints.Project.getById(projectId));
      return new Project(result);
    });
  }

  public async getAll(): Promise<Project[]> {
    return loggedApiRequest(async () => {
      const result = await Api.get<ProjectDto[]>(Endpoints.Project.getAll());
      return result.map((projectDto) => new Project(projectDto));
    });
  }

  public async save(project: Project): Promise<Project> {
    return loggedApiRequest(async () => {
      const result = await Api.putJson<ProjectDto>(Endpoints.Project.save(project.id), { body: project.toDto() });
      return new Project(result);
    });
  }
}

export default new ProjectService();
