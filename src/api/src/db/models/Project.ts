import isArray from "../../util/is-array";
import Task, { TaskDto } from "./Task";


export interface ProjectArgs {
  id: string;
  name: string;
  tasks: Task[];
}

export interface ProjectDto {
  id: string;
  name: string;
  tasks: TaskDto[];
}

export default class Project {
  public readonly id: string;
  public readonly name: string;
  public readonly tasks: Task[];

  public constructor({ id, name, tasks }: ProjectArgs) {
    this.id = id;
    this.name = name;
    this.tasks = tasks;
  }

  public getTaskById(id: string): Task | undefined {
    return this.tasks.find((task: Task) => task.id === id);
  }

  public static fromRaw(attributes: Record<string, any>): Project {
    // Attributes
    const id: string | unknown = attributes['id'];
    const name: string | unknown = attributes['name'];
    const tasks: Record<string, unknown>[] | unknown = attributes['tasks'];

    // Validation
    if (id === undefined) throw new Error("Cannot parse attribute map. Field `id` is empty");
    if (typeof id !== 'string') throw new Error("Cannot parse attribute map. Field `id` must be a string (type 'S')");

    if (name === undefined) throw new Error("Cannot parse attribute map. Field `name` is empty");
    if (typeof name !== 'string') throw new Error("Cannot parse attribute map. Field `name` must be a string (type 'S')");

    if (tasks === undefined) throw new Error("Cannot parse attribute map. Field `tasks` is empty");
    if (!isArray<Record<string, unknown>>(tasks, (task) => typeof task === 'object' && !Array.isArray(task))) throw new Error("Cannot parse attribute map. Field `tasks` must be an array of objects (type 'M')");

    // Construction
    return new Project({
      id,
      name,
      tasks: tasks.map((item, index) => {
        if (item === undefined) throw new Error(`Cannot parse attribute map. Field 'tasks' has invalid member: index [${index}] is empty`);

        return Task.fromRaw(item);
      }),
    });
  }

  public toDto(): ProjectDto {
    return {
      id: this.id,
      name: this.name,
      tasks: this.tasks.map((task) => task.toDto()),
    };
  }

  public static fromDto(project: ProjectDto): Project {
    return new Project({
      id: project.id,
      name: project.name,
      tasks: project.tasks.map((taskDto) => Task.fromDto(taskDto)),
    });
  }
}
