import { handler } from '@app/handlers/project/get';
import ErrorId from '@app/errors/ErrorId';
import Project, { ProjectDto } from '@app/db/models/Project';
import Task from '@app/db/models/Task';

import MockDb from '@test/mocks/mockDb';
import { invokeHandler } from '@test/util/invoke-handler';
import SimpleRequest from '@test/local/util/SimpleRequest';

describe("GetProject handler", () => {
  beforeEach(() => {
    MockDb.reset();
  });


  test('Requesting a project with a valid ID returns the correct project', async () => {
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
      ],
    });

    MockDb.projects = [
      mockProject,
      new Project({
        id: 'f101840c-4fb4-4816-b6f1-aea6f47f03f1',
        name: "My other mock project",
        tasks: [],
      }),
    ];

    const mockRequest: SimpleRequest = {
      httpMethod: 'GET',
      path: `/project/${mockProject.id}`,
      pathParams: {
        id: mockProject.id,
      },
    };

    const expectedResponse: ProjectDto = {
      id: mockProject.id,
      name: mockProject.name,
      tasks: mockProject.tasks.map((task) => task.toDto()),
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  test("Getting a project with an ID that doesn't exist returns a 404", async () => {
    // Setup
    MockDb.projects = [];

    const mockProjectId = '51e5db90-0587-471f-a281-0b37b7eccb8c';

    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'GenericError',
        modelVersion: 1,
        id: ErrorId.Project_Get_NoProjectExistsWithId,
        message: `No project exists with id: ${mockProjectId}`,
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/project/${mockProjectId}`,
      pathParams: {
        id: mockProjectId,
      },
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);

    // Assert
    expect(response.statusCode).toBe(404);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });

  test("Making a request with an empty ID param returns a 400", async () => {
    // @NOTE technically this cannot happen, as the id param is a path param, used for routing
    // Setup
    const expectedResponse = {
      model: 'ApiError',
      modelVersion: 1,
      errors: [{
        model: 'RequestValidationError',
        modelVersion: 1,
        field: 'id',
        message: "Missing or invalid path parameter",
      }],
    };

    const mockRequest: SimpleRequest = {
      path: `/project/`,
      pathParams: {
        id: '',
      },
    };

    // Test
    const response = await invokeHandler(handler, mockRequest);


    // Assert
    expect(response.statusCode).toBe(400);
    expect(response.headers && response.headers['Content-Type']).toBe('application/json');
    expect(response.body && JSON.parse(response.body)).toEqual(expectedResponse);
  });
});
