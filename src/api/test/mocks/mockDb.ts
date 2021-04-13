import { v4 as uuid } from 'uuid';

import IDatabase, { AddProjectArgs, AddTaskArgs } from '@app/db/IDatabase';
import Project from '@app/db/models/Project';
import Task from '@app/db/models/Task';

// Simple in-memory implementation of IDatabase, for testing
export default class MockDb implements IDatabase {
  public static projects: Project[] = [];

  public async addProject({ name }: AddProjectArgs): Promise<Project> {
    const newProject = new Project({
      id: uuid(),
      name,
      tasks: [],
    });

    return await this.saveProject(newProject);
  }
  public getProject(id: string): Promise<Project | undefined> {
    return Promise.resolve(MockDb.projects.find((project) => project.id === id));
  }
  public getAllProjects(): Promise<Project[]> {
    return Promise.resolve(MockDb.projects);
  }
  public saveProject(project: Project): Promise<Project> {
    const existingProjectIndex = MockDb.projects.findIndex((dbProject) => dbProject.id === project.id);
    if (existingProjectIndex === -1) {
      // Insert new row
      MockDb.projects.push(project);
      return Promise.resolve(project);
    } else {
      // Update existing record
      return Promise.resolve(
        Object.assign(MockDb.projects[existingProjectIndex], project),
      );
    }
  }
  public deleteProject(id: string): Promise<Project | undefined> {
    const existingProjectIndex = MockDb.projects.findIndex((dbProject) => dbProject.id === id);
    if (existingProjectIndex === -1) {
      return Promise.resolve(undefined);
    } else {
      const deletedProject = MockDb.projects.splice(existingProjectIndex, 1)[0];
      return Promise.resolve(deletedProject);
    }
  }
  public async addTask(project: Project, { description }: AddTaskArgs): Promise<Task> {
    const newTask = new Task({
      id: uuid(),
      description,
      isDone: false,
    });

    project.tasks.push(newTask);

    await this.saveProject(project);

    return newTask;
  }
  public async getTask(project: Project, id: string): Promise<Task | undefined> {
    return Promise.resolve(project.getTaskById(id));
  }
  public async getAllTasks(project: Project): Promise<Task[] | undefined> {
    return Promise.resolve(project.tasks);
  }
  public async saveTask(project: Project, task: Task): Promise<Task> {
    const existingTaskIndex = project.tasks.findIndex((projectTask: Task) => projectTask.id === task.id);
    if (existingTaskIndex === -1) {
      // Insert new row
      project.tasks.push(task);
    } else {
      // Update existing record
      project.tasks[existingTaskIndex] = task;
    }

    await this.saveProject(project);

    return task;
  }
  public async deleteTask(project: Project, id: string): Promise<Task | undefined> {
    const existingTaskIndex = project.tasks.findIndex((projectTask: Task) => projectTask.id === id);
    if (existingTaskIndex === -1) {
      return Promise.resolve(undefined);
    } else {
      const deletedTask = project.tasks.splice(existingTaskIndex, 1)[0];
      return Promise.resolve(deletedTask);
    }
  }


  public static reset(): void {
    this.projects = [];
  }
}
