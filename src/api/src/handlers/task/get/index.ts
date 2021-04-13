import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '../../../config';
import Db from '../../../db';
import IDatabase from '../../../db/IDatabase';
import Logger from '../../../util/Logger';
import errorResponse from '../../../util/response/error';
import badRequestResponse from "../../../util/response/bad-request";
import ApiError from "../../../errors/ApiError";
import RequestValidationError from "../../../errors/RequestValidationError";
import UnknownError from "../../../errors/UnknownError";
import ErrorModel from "../../../errors/ErrorModel";
import Project from "../../../db/models/Project";
import { isValidProjectId } from "../../../validators/project";
import { isValidTaskId } from "../../../validators/task";
import ErrorId from "../../../errors/ErrorId";
import notFoundResponse from "../../../util/response/not-found";
import GenericError from "../../../errors/GenericError";
import Task from "../../../db/models/Task";
import okResponse from "../../../util/response/ok";

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
        error: new GenericError(ErrorId.Task_Get_NoProjectExistsWithId, `No project exists with id: ${projectId}`),
      }));
    }

    // Validate `taskId`
    const task: Task | undefined = await db.getTask(project, taskId);
    if (task === undefined) {
      return notFoundResponse(new ApiError({
        error: new GenericError(ErrorId.Task_Get_NoTaskExistsWithId, `No task exists with id: ${taskId}`),
      }));
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    Logger.log(`Successfully looked up task with id '${taskId}' for project with id '${projectId}'`);

    return okResponse(task.toDto());
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
