import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '@app/config';
import Db from '@app/db';
import IDatabase from '@app/db/IDatabase';
import Logger from '@app/util/Logger';
import errorResponse from '@app/util/response/error';
import ApiError from "@app/errors/ApiError";
import UnknownError from "@app/errors/UnknownError";
import ErrorModel from "@app/errors/ErrorModel";
import Project from "@app/db/models/Project";
import Task from "@app/db/models/Task";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    await Promise.all(MOCK_DATA.map(async (mockProject) => {
      await db.saveProject(mockProject);
    }));

    Logger.log(`Successfully seeded database with ${MOCK_DATA.length} mock projects`);

    return {
      statusCode: 204,
    };
  } catch (err) {
    // Error occurred while processing
    let error: ErrorModel;
    if (err instanceof ErrorModel) {
      error = err;
    } else {
      error = new UnknownError(err as (string | Error));
    }

    return errorResponse(new ApiError({
      message: "An error occurred while processing.",
      error,
    }));
  }
};

const MOCK_DATA: Project[] = [
  new Project({
    id: 'd584b97d-41c1-4396-89be-afd8bb254742',
    name: "My fancy project",
    tasks: [
      new Task({
        id: '211c3f8e-2285-4dad-8cbc-4db141d20caf',
        description: "Go for a 10 minute walk",
        isDone: false,
      }),
      new Task({
        id: 'bc54f2c6-a4d3-430d-87f3-e86ec3163ce8',
        description: "Hang up photographs",
        isDone: false,
      }),
    ],
  }),
  new Project({
    id: '43de3da1-bb1e-4863-9eba-fcb86316e672',
    name: "Rooms that need vacuuming",
    tasks: [
      new Task({
        id: '04980f53-f81d-4494-ac8b-d7c43f22ef95',
        description: "Kitchen",
        isDone: true,
      }),
      new Task({
        id: 'd5974009-066d-4795-891e-b6481b7f0826',
        description: "Bedroom",
        isDone: false,
      }),
      new Task({
        id: 'ebfa03ec-8c8e-4539-94c9-f2237133b7df',
        description: "Bathroom",
        isDone: false,
      }),
      new Task({
        id: '8e019d1d-f58d-4430-8851-4c5ff34c6cc6',
        description: "Dining Room",
        isDone: false,
      }),
    ],
  }),
];
