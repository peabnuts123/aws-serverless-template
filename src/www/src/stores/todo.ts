import { action, computed, observable, makeObservable, runInAction } from "mobx";
import { v4 as uuid } from 'uuid';

import Project from "@app/models/Project";
import ProjectService from "@app/services/project";
import TaskService from "@app/services/task";
import Task from "@app/models/Task";
import Logger, { LogLevel } from "@app/util/Logger";

export default class TodoStore {
  @observable
  private projects!: Project[];
  @observable
  private hasLoaded!: boolean;

  public constructor() {
    makeObservable(this);
    this.projects = [];
    this.hasLoaded = false;
  }

  @action
  public async ensureProjectsLoaded(): Promise<void> {
    if (this.projects.length === 0) {
      await this.refreshAllProjects();
    }
  }

  @action
  public async refreshAllProjects(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const projects = await ProjectService.getAll();
    runInAction(() => {
      Logger.log(LogLevel.debug, "Refreshed projects");
      this.hasLoaded = true;
      this.projects = projects;
    });
  }

  public getProjectById(projectId: string): Project | undefined {
    return this.projects.find((project) => project.id === projectId);
  }

  @action
  public async createProject(name: string): Promise<Project> {
    // 1. Create a "Loading" project so we can update the table NOW
    const fakeProject = new Project({
      id: 'TEMP_' + uuid(),
      name,
      tasks: [],
    });
    fakeProject.isBeingCreated = true;
    this.projects.push(fakeProject);

    // 2. Create a real project in the API
    const newProject = await ProjectService.create({ name });

    runInAction(() => {
      // 3. Replace the fake project with the real project
      const indexOfFakeProject = this.projects.indexOf(fakeProject);
      this.projects[indexOfFakeProject] = newProject;
    });
    return newProject;
  }

  @action
  public async deleteProject(project: Project): Promise<void> {
    const existingProjectIndex = this.projects.findIndex((existingProject) => existingProject.id === project.id);
    this.projects.splice(existingProjectIndex, 1);
    await ProjectService.delete(project);
  }

  @action
  public async saveProject(project: Project): Promise<void> {
    const existingProjectIndex = this.projects.findIndex((existingProject) => existingProject.id === project.id);
    this.projects[existingProjectIndex] = project;
    await ProjectService.save(project);
  }

  @action
  public async createTask(project: Project, description: string): Promise<Task> {
    // 1. Create a "Loading" task so we can update the table NOW
    const fakeTask = new Task({
      id: 'TEMP_' + uuid(),
      description,
      isDone: false,
    });
    fakeTask.isBeingCreated = true;
    project.tasks.push(fakeTask);

    // 2. Create a real task in the API
    const newTask = await TaskService.create(project, { description });

    runInAction(() => {
      // 3. Replace the fake task with the real task
      const indexOfFakeTask = project.tasks.indexOf(fakeTask);
      project.tasks[indexOfFakeTask] = newTask;
    });
    return newTask;
  }

  @action
  public async deleteTask(project: Project, task: Task): Promise<void> {
    const existingTaskIndex = project.tasks.findIndex((existingTask) => existingTask.id === task.id);
    project.tasks.splice(existingTaskIndex, 1);
    await TaskService.delete(project, task);
  }

  @action
  public async saveTask(project: Project, task: Task): Promise<void> {
    const existingTaskIndex = project.tasks.findIndex((existingTask) => existingTask.id === task.id);
    project.tasks[existingTaskIndex] = task;
    await TaskService.save(project, task);
  }

  // Properties
  @computed
  public get Projects(): Project[] {
    return this.projects;
  }
  @computed
  public get HasLoaded(): boolean {
    return this.hasLoaded;
  }
}
