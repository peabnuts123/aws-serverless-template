import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '@app/config';
import Db from '@app/db';
import IDatabase from '@app/db/IDatabase';
import Logger from '@app/util/Logger';
import errorResponse from '@app/util/response/error';
import badRequestResponse from "@app/util/response/bad-request";
import ApiError from "@app/errors/ApiError";
import RequestValidationError from "@app/errors/RequestValidationError";
import UnknownError from "@app/errors/UnknownError";
import ErrorModel from "@app/errors/ErrorModel";
import Project from "@app/db/models/Project";
import { isValidProjectId } from "@app/validators/project";
import { isValidTaskId } from "@app/validators/task";
import ErrorId from "@app/errors/ErrorId";
import notFoundResponse from "@app/util/response/not-found";
import GenericError from "@app/errors/GenericError";
import Task from "@app/db/models/Task";
import okResponse from "@app/util/response/ok";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // Validate path parameters exist
    const projectId: string | unknown = event.pathParameters?.projectId;
    if (!isValidProjectId(projectId)) {
      return badRequestResponse(new ApiError({
        error: new RequestValidationError('projectId', "Missing or invalid path parameter"),
      }));
    }
    const taskId: string | unknown = event.pathParameters?.id;
    if (!isValidTaskId(taskId)) {
      return badRequestResponse(new ApiError({
        error: new RequestValidationError('id', "Missing or invalid path parameter"),
      }));
    }

    // VALIDATION
    const validationErrors: ErrorModel[] = [];

    // Validate `projectId`
    const project: Project | undefined = await db.getProject(projectId);
    if (project === undefined) {
      return notFoundResponse(new ApiError({
        error: new GenericError(ErrorId.Task_Delete_NoProjectExistsWithId, `No project exists with id: ${projectId}`),
      }));
    }

    // Validate `taskId`
    const task: Task | undefined = await db.getTask(project, taskId);
    if (task === undefined) {
      return notFoundResponse(new ApiError({
        error: new GenericError(ErrorId.Task_Delete_NoTaskExistsWithId, `No task exists with id: ${taskId}`),
      }));
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    // Delete task by id (which we know exists)
    const deletedTask: Task = await db.deleteTask(project, taskId) as Task;

    Logger.log(`Successfully deleted task with id '${taskId}' from project with id '${projectId}'`);

    return okResponse(deletedTask.toDto());
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
