import { TaskDto } from "@app/db/models/Task";

export function isValidTaskId(maybeId: unknown): maybeId is string {
  return typeof maybeId === 'string' && maybeId.trim() !== '';
}

export function isValidTaskDescription(maybeDescription: unknown): maybeDescription is string {
  return typeof maybeDescription === 'string' && maybeDescription.trim() !== '';
}

export function isValidTaskIsDone(maybeIsDone: unknown): maybeIsDone is boolean {
  return typeof maybeIsDone === 'boolean';
}

export function isValidTaskDto(maybeTaskDto: unknown): maybeTaskDto is TaskDto {
  const taskDto: TaskDto = maybeTaskDto as TaskDto;
  return isValidTaskId(taskDto.id) &&
    isValidTaskDescription(taskDto.description) &&
    isValidTaskIsDone(taskDto.isDone);
}
