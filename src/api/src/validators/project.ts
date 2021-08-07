import { TaskDto } from "@app/db/models/Task";
import isArray from "@app/util/is-array";

import { isValidTaskDto } from "./task";

export function isValidProjectId(maybeId: unknown): maybeId is string {
  return typeof maybeId === 'string' && maybeId.trim() !== '';
}

export function isValidProjectName(maybeName: unknown): maybeName is string {
  return typeof maybeName === 'string' && maybeName.trim() !== '';
}

export function isValidProjectTaskDtos(maybeTaskDtos: unknown): maybeTaskDtos is TaskDto[] {
  return isArray<TaskDto>(maybeTaskDtos, isValidTaskDto);
}
