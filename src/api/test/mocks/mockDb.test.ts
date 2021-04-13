import IDatabase from '@app/db/IDatabase';
import Project from '@app/db/models/Project';
import Task from '@app/db/models/Task';

import MockDb from '@test/mocks/mockDb';

describe('MockDB', () => {

  beforeEach(() => {
    MockDb.reset();
  });

  test('Adding mock data works', async () => {
    // Setup
    const mockProject: Project = new Project({
      id: '5998098e-5fe4-4d11-a87e-d30c73612ca6',
      name: "My mock project",
      tasks: [
        new Task({
          id: '5b34a982-cb87-4e26-8777-15a2fce12bea',
          description: "Mock task 1",
          isDone: false,
        }),
        new Task({
          id: 'f3d8569c-959f-4fc9-b13d-6d7bda9ddcfe',
          description: "Mock task 2",
          isDone: true,
        }),
      ],
    });

    const db: IDatabase = new MockDb();

    // Test
    await db.saveProject(mockProject);
    const project = MockDb.projects[0];

    // Assert
    expect(MockDb.projects.length).toBe(1);
    expect(project.id).toBe(mockProject.id);
    expect(project.name).toBe(mockProject.name);
    expect(project.tasks.length).toBe(mockProject.tasks.length);
    project.tasks.forEach((projectTask, index) => {
      expect(projectTask.id).toBe(mockProject.tasks[index].id);
      expect(projectTask.description).toBe(mockProject.tasks[index].description);
      expect(projectTask.isDone).toBe(mockProject.tasks[index].isDone);
    });
  });
});
