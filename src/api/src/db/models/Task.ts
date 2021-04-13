export interface TaskArgs {
  id: string;
  description: string;
  isDone: boolean;
}

export interface TaskDto {
  id: string;
  description: string;
  isDone: boolean;
}

export default class Task {
  public readonly id: string;
  public readonly description: string;
  public readonly isDone: boolean;

  public constructor({ id, description, isDone }: TaskArgs) {
    this.id = id;
    this.description = description;
    this.isDone = isDone;
  }

  public static fromRaw(attributes: Record<string, any>): Task {
    // Attributes
    const id: string | unknown = attributes['id'];
    const description: string | unknown = attributes['description'];
    const isDone: boolean | unknown = attributes['isDone'];

    // Validation
    if (id === undefined) throw new Error("Cannot parse attribute map. Field `id` is empty");
    if (typeof id !== 'string') throw new Error("Cannot parse attribute map. Field `id` must be a string (type 'S')");

    if (description === undefined) throw new Error("Cannot parse attribute map. Field `description` is empty");
    if (typeof description !== 'string') throw new Error("Cannot parse attribute map. Field `description` must be a string (type 'S')");

    if (isDone === undefined) throw new Error("Cannot parse attribute map. Field `isDone` is empty");
    if (typeof isDone !== 'boolean') throw new Error("Cannot parse attribute map. Field `isDone` must be a boolean (type 'BOOL')");

    // Construction
    return new Task({ id, description, isDone });
  }

  public toDto(): TaskDto {
    return {
      id: this.id,
      description: this.description,
      isDone: this.isDone,
    };
  }

  public static fromDto(dto: TaskDto): Task {
    return new Task({
      id: dto.id,
      description: dto.description,
      isDone: dto.isDone,
    });
  }

}
