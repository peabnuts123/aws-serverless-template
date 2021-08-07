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
import { isValidTaskDescription, isValidTaskId, isValidTaskIsDone } from "@app/validators/task";
import ErrorId from "@app/errors/ErrorId";
import notFoundResponse from "@app/util/response/not-found";
import GenericError from "@app/errors/GenericError";
import Task from "@app/db/models/Task";
import okResponse from "@app/util/response/ok";

import { SaveTaskDto } from './dto';

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

    // Validating body exists
    if (event.body === undefined || event.body.trim() === '') {
      return badRequestResponse(new ApiError({
        error: new RequestValidationError('body', "Missing or empty body"),
      }));
    }

    // Validate content-type header (extremely safely)
    // 1. Case-insensitive header lookup (AWS might provide an object that does this, but mocks won't)
    const contentTypeHeaderKey = Object.keys(event.headers).find((headerName) => headerName.toLocaleLowerCase() === 'content-type');
    // 2. Case-insensitive, whitespace insensitive, encoding-insensitive test for 'application/json'
    if (contentTypeHeaderKey === undefined || !event.headers[contentTypeHeaderKey].trim().toLocaleLowerCase().startsWith('application/json')) {
      return badRequestResponse(new ApiError({
        error: new RequestValidationError('headers', "Requests must be JSON with header 'Content-Type: application/json'"),
      }));
    }

    // Parse body as JSON (knowing the request must HAVE a header specifying the content-type as JSON)
    //  Any parsing errors will be caught and a BadRequest response served
    let dto: SaveTaskDto;
    try {
      dto = JSON.parse(event.body) as SaveTaskDto;
    } catch (err) {
      if (err instanceof SyntaxError) {
        // Invalid JSON
        return badRequestResponse(new ApiError({
          error: new RequestValidationError('body', "Could not parse body - likely invalid JSON"),
        }));
      } else {
        // Unknown error (likely impossible)
        return errorResponse(new ApiError({
          message: "An error occurred while parsing JSON body",
          error: new UnknownError(err as string | Error),
        }));
      }
    }

    // VALIDATION
    const validationErrors: ErrorModel[] = [];

    // Validate `projectId`
    const project: Project | undefined = await db.getProject(projectId);
    if (project === undefined) {
      return notFoundResponse(new ApiError({
        error: new GenericError(ErrorId.Task_Save_NoProjectExistsWithId, `No project exists with id: ${projectId}`),
      }));
    }

    // Validate `taskId`
    const task: Task | undefined = await db.getTask(project, taskId);
    if (task === undefined) {
      return notFoundResponse(new ApiError({
        error: new GenericError(ErrorId.Task_Save_NoTaskExistsWithId, `No task exists with id: ${taskId}`),
      }));
    }

    // Validate `description`
    let description = dto.description;
    if (description !== undefined && !isValidTaskDescription(description)) {
      // - ensure `description` is correct type / defined / not empty
      validationErrors.push(new RequestValidationError('description', "Field must be a non-empty string"));
    } else if (description !== undefined) {
      description = description.trim();
    }

    // Validate `isDone`
    const isDone = dto.isDone;
    if (isDone !== undefined && !isValidTaskIsDone(isDone)) {
      validationErrors.push(new RequestValidationError('isDone', "Field must be a boolean"));
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    const updatedTask = Task.fromDto({
      ...task.toDto(),
      id: taskId,
      description: description !== undefined ? description : task.description,
      isDone: isDone !== undefined ? isDone : task.isDone,
    });

    await db.saveTask(project, updatedTask);

    Logger.log(`Successfully updated task with id '${taskId}' in project with id '${projectId}'`);

    return okResponse(updatedTask.toDto());
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
