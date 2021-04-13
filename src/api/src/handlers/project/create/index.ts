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
import { isValidProjectName } from "../../../validators/project";

import { CreateProjectDto } from './dto';

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
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
    let dto: CreateProjectDto;
    try {
      dto = JSON.parse(event.body) as CreateProjectDto;
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

    // Validate `name`
    let name: string = dto.name as string;
    if (!isValidProjectName(name)) {
      // - ensure `name` is correct type / defined / not empty
      validationErrors.push(new RequestValidationError('name', "Field must be a non-empty string"));
    } else {
      name = name.trim();
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    const newProject: Project = await db.addProject({ name });

    Logger.log(`Successfully created new project with id:`, newProject.id);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProject),
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
