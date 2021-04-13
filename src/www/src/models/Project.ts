import { makeAutoObservable } from "mobx";
import ApiModel from "./base/ApiModel";
import Task, { TaskDto } from "./Task";

export interface ProjectDto {
  id: string;
  name: string;
  tasks: TaskDto[];
}

class Project implements ApiModel<ProjectDto> {
  public readonly id: string;
  public name: string;
  public tasks: Task[];

  public isBeingCreated: boolean;

  public constructor(dto: ProjectDto) {
    this.id = dto.id;
    this.name = dto.name;
    this.tasks = dto.tasks.map((taskDto) => new Task(taskDto));

    this.isBeingCreated = false;

    makeAutoObservable(this);
  }

  public toDto(): ProjectDto {
    return {
      id: this.id,
      name: this.name,
      tasks: this.tasks.map((task) => task.toDto()),
    };
  }
}

export default Project;
