import { makeAutoObservable } from "mobx";
import ApiModel from "./base/ApiModel";

export interface TaskDto {
  id: string;
  description: string;
  isDone: boolean;
}

class Task implements ApiModel<TaskDto> {
  public readonly id: string;
  public description: string;
  public isDone: boolean;

  public isBeingCreated: boolean;

  public constructor(dto: TaskDto) {
    this.id = dto.id;
    this.description = dto.description;
    this.isDone = dto.isDone;

    this.isBeingCreated = false;

    makeAutoObservable(this);
  }

  public toDto(): TaskDto {
    return {
      id: this.id,
      description: this.description,
      isDone: this.isDone,
    };
  }
}

export default Task;
