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
import { isValidTaskDescription } from "../../../validators/task";
import ErrorId from "../../../errors/ErrorId";
import notFoundResponse from "../../../util/response/not-found";
import GenericError from "../../../errors/GenericError";
import Task from "../../../db/models/Task";

import { CreateTaskDto } from './dto';


Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // Validate path parameter exists
    const projectId: string | unknown = event.pathParameters?.projectId;
    if (!isValidProjectId(projectId)) {
      return badRequestResponse(new ApiError({
        error: new RequestValidationError('projectId', "Missing or invalid path parameter"),
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
    let dto: CreateTaskDto;
    try {
      dto = JSON.parse(event.body) as CreateTaskDto;
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
        error: new GenericError(ErrorId.Task_Create_NoProjectExistsWithId, `No project exists with id: ${projectId}`),
      }));
    }

    // Validate `description`
    let description: string = dto.description as string;
    if (!isValidTaskDescription(description)) {
      // - ensure `description` is correct type / defined / not empty
      validationErrors.push(new RequestValidationError('description', "Field must be a non-empty string"));
    } else {
      description = description.trim();
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    const newTask: Task = await db.addTask(project, {
      description,
    });

    Logger.log(`Successfully added new task with id '${newTask.id}' to project with id '${projectId}'`);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
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
