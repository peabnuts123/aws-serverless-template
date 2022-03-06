using Microsoft.AspNetCore.Mvc;
using MyProject.Business.Services;
using MyProject.Common;
using MyProject.Data.Models;

namespace MyProject.Web.Controllers;


[ApiController]
[Route("api/project/{projectId}/task")]
public class TaskController : ControllerBase
{
    private readonly ILogger<TaskController> logger;
    private readonly TaskService taskService;
    private readonly ProjectService projectService;

    public TaskController(ILogger<TaskController> logger, TaskService taskService, ProjectService projectService)
    {
        this.logger = logger;
        this.taskService = taskService;
        this.projectService = projectService;
    }

    [HttpPost]
    [Route("")]
    public async Task<ActionResult<Data.Models.Task>> Create(Guid projectId, CreateTaskDto dto)
    {
        // Ensure project exists
        Project? project = await projectService.Get(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Task_Create_NoProjectExistsWithId, $"No project exists with id: {projectId}")
            ));
        }

        // Process DTO
        string description = dto.Description.Trim();

        Data.Models.Task newTask = await taskService.Create(project, description!);
        logger.LogInformation("Successfully added new task with id '{newTaskId}' to project with id '{projectId}'", newTask.Id, project.Id);

        return new OkObjectResult(newTask)
        {
            StatusCode = 201,
        };
    }

    [HttpDelete]
    [Route("{taskId}")]
    public async Task<ActionResult<Data.Models.Task>> Delete(Guid projectId, Guid taskId)
    {
        // Ensure project exists
        Project? project = await projectService.Get(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Task_Delete_NoProjectExistsWithId, $"No project exists with id: {projectId}")
            ));
        }

        // Ensure task exists
        Data.Models.Task? task = await taskService.Get(project, taskId);
        if (task == null)
        {
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Task_Delete_NoTaskExistsWithId, $"No task exists with id: {taskId}")
            ));
        }

        Data.Models.Task deletedTask = await taskService.Delete(project, task);
        logger.LogInformation("Successfully deleted task with id '{taskId}' from project with id '{projectId}'", deletedTask.Id, project.Id);

        return new OkObjectResult(deletedTask);
    }

    [HttpGet]
    [Route("{taskId}")]
    public async Task<ActionResult<Data.Models.Task>> Get(Guid projectId, Guid taskId)
    {
        // Ensure project exists
        Project? project = await projectService.Get(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Task_Get_NoProjectExistsWithId, $"No project exists with id: {projectId}")
            ));
        }

        // Ensure task exists
        Data.Models.Task? task = await taskService.Get(project, taskId);
        if (task == null)
        {
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Task_Get_NoTaskExistsWithId, $"No task exists with id: {projectId}")
            ));
        }

        logger.LogInformation("Successfully looked up task with id '{taskId}' for project with id '{projectId}'", task.Id, project.Id);

        return new OkObjectResult(task);
    }

    [HttpGet]
    [Route("")]
    public async Task<ActionResult<Data.Models.Task>> GetAll(Guid projectId)
    {
        // Ensure project exists
        Project? project = await projectService.Get(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Task_Get_NoProjectExistsWithId, $"No project exists with id: {projectId}")
            ));
        }

        List<Data.Models.Task> allTasks = await taskService.GetAll(project);

        logger.LogInformation("Successfully looked up all tasks for project with id '{projectId}'", project.Id);

        return new OkObjectResult(allTasks);
    }

    [HttpPut]
    [Route("{taskId}")]
    public async Task<ActionResult<Data.Models.Task>> Save(Guid projectId, Guid taskId, SaveTaskDto dto)
    {
        // Ensure project exists
        Project? project = await projectService.Get(projectId);
        if (project == null)
        {
            // Immediately serve not-found (no validation errors)
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Task_Save_NoProjectExistsWithId, $"No project exists with id: {projectId}")
            ));
        }
        // Ensure task exists
        Data.Models.Task? task = await taskService.Get(project, taskId);
        if (task == null)
        {
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Task_Save_NoTaskExistsWithId, $"No task exists with id: {projectId}")
            ));
        }

        // Process DTO
        string? description = dto.Description?.Trim();
        bool? isDone = dto.IsDone;

        // Update task model
        if (description != null)
        {
            task.Description = description;
        }
        if (isDone.HasValue)
        {
            task.IsDone = isDone.Value;
        }

        Data.Models.Task updatedTask = await taskService.Save(project, task);
        logger.LogInformation("Successfully updated task with id '{taskId}' in project with id '{projectId}'", updatedTask.Id, project.Id);

        return new OkObjectResult(updatedTask);
    }
}