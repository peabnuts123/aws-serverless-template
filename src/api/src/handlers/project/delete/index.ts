import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import Config from '../../../config';

import Db from '../../../db';
import IDatabase from '../../../db/IDatabase';

import Logger from '../../../util/Logger';
import errorResponse from '../../../util/response/error';
import badRequestResponse from '../../../util/response/bad-request';
import notFoundResponse from "../../../util/response/not-found";
import ApiError from "../../../errors/ApiError";
import GenericError from "../../../errors/GenericError";
import ErrorId from "../../../errors/ErrorId";
import okResponse from "../../../util/response/ok";
import ErrorModel from "../../../errors/ErrorModel";
import UnknownError from "../../../errors/UnknownError";
import RequestValidationError from "../../../errors/RequestValidationError";
import { isValidProjectId } from "../../../validators/project";
import Project from "../../../db/models/Project";

Logger.setLogLevel(Config.logLevel);

const db: IDatabase = new Db();

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  Logger.log(`Handling request: ${event.requestContext.http.method} ${event.rawPath}${event.rawQueryString ? '?' + event.rawQueryString : ''}`);

  try {
    // Validate path parameter exists
    const projectId: string | unknown = event.pathParameters?.id;
    if (!isValidProjectId(projectId)) {
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
        error: new GenericError(ErrorId.Project_Delete_NoProjectExistsWithId, `No project exists with id: ${projectId}`),
      }));
    }

    // Return validation errors
    if (validationErrors.length > 0) {
      return badRequestResponse(new ApiError({
        errors: validationErrors,
      }));
    }

    // Delete project by id (which we know exists)
    const deletedProject: Project = await db.deleteProject(projectId) as Project;

    Logger.log("Successfully deleted project with id:", projectId);

    return okResponse(deletedProject.toDto());
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
