import Project from "./models/Project";
import Task from "./models/Task";


export interface AddProjectArgs {
  name: string;
}

export interface AddTaskArgs {
  description: string;
}

interface IDatabase {
  addProject(args: AddProjectArgs): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  saveProject(project: Project): Promise<Project>;
  deleteProject(id: string): Promise<Project | undefined>;

  addTask(project: Project, args: AddTaskArgs): Promise<Task>;
  getTask(project: Project, id: string): Promise<Task | undefined>;
  getAllTasks(project: Project): Promise<Task[] | undefined>;
  saveTask(project: Project, task: Task): Promise<Task>;
  deleteTask(project: Project, id: string): Promise<Task | undefined>;
}

export default IDatabase;
