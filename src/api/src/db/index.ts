import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, ScanCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

import Config from '@app/config';
import Logger, { LogLevel } from '@app/util/Logger';

import IDatabase, { AddProjectArgs, AddTaskArgs } from './IDatabase';
import Project from './models/Project';
import Task from './models/Task';


class Db implements IDatabase {
  private docClient: DynamoDBDocumentClient;

  public constructor() {
    const dynamoDbClient = new DynamoDBClient(this.baseOptions);
    this.docClient = DynamoDBDocumentClient.from(dynamoDbClient, {
      marshallOptions: {
        convertClassInstanceToMap: true,
      },
    });
  }

  private get baseOptions(): DynamoDBClientConfig {
    const options: DynamoDBClientConfig = {
      region: 'us-east-1',
    };

    // @NOTE assumption: Any configuration for `Config.awsEndpoint` implies
    //  the use of Localstack
    if (Config.awsEndpoint) {
      options.endpoint = Config.awsEndpoint;
      Logger.log(LogLevel.debug, "Setting AWS endpoint to localstack");
    }

    return options;
  }

  public async addProject({ name }: AddProjectArgs): Promise<Project> {
    const newProject = new Project({
      id: uuid(),
      name,
      tasks: [],
    });

    return await this.saveProject(newProject);
  }

  public async getProject(id: string): Promise<Project | undefined> {
    const result = await this.docClient.send(new GetCommand({
      TableName: Config.projectTableName,
      Key: { id },
    }));

    if (result.Item === undefined) {
      return undefined;
    } else {
      return Project.fromRaw(result.Item);
    }
  }

  public async getAllProjects(): Promise<Project[]> {
    const result = await this.docClient.send(new ScanCommand({
      TableName: Config.projectTableName,
    }));

    if (result.Items === undefined) {
      // Special case because `scan()` can't really fail unless something is wrong
      Logger.logError("Failed to fetch all projects, response was empty.", result);
      throw new Error("Failed to fetch all projects, response was empty. See logs for more details.");
    }

    return result.Items.map((item) => Project.fromRaw(item));
  }

  public async saveProject(project: Project): Promise<Project> {
    await this.docClient.send(new PutCommand({
      TableName: Config.projectTableName,
      Item: project,
    }));

    return project;
  }

  public async deleteProject(id: string): Promise<Project | undefined> {
    const existingProject = await this.getProject(id);
    if (existingProject === undefined) {
      // No project exists with id - return undefined
      return undefined;
    } else {
      // Project exists - delete and return it
      await this.docClient.send(new DeleteCommand({
        TableName: Config.projectTableName,
        Key: { id },
      }));

      return existingProject;
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

  public getTask(project: Project, id: string): Promise<Task | undefined> {
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
      return undefined;
    } else {
      const deletedTask = project.tasks.splice(existingTaskIndex, 1)[0];
      await this.saveProject(project);
      return deletedTask;
    }
  }
}

export default Db;
