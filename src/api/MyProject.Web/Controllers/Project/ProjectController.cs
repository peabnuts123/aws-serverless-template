using Microsoft.AspNetCore.Mvc;
using MyProject.Business.Services;
using MyProject.Common;
using MyProject.Data.Models;

namespace MyProject.Web.Controllers;

[ApiController]
[Route("api/project")]
public class ProjectController : ControllerBase
{
    private readonly ILogger<ProjectController> logger;
    private readonly ProjectService projectService;

    public ProjectController(ILogger<ProjectController> logger, ProjectService projectService)
    {
        this.logger = logger;
        this.projectService = projectService;
    }

    [HttpPost]
    [Route("")]
    public async Task<ActionResult<Project>> Create(CreateProjectDto dto)
    {
        // Process DTO
        string name = dto.Name.Trim();

        // Create
        Project newProject = await projectService.Create(name!);
        logger.LogInformation("Successfully created new project with id: {projectId}", newProject.Id);

        return new OkObjectResult(newProject)
        {
            StatusCode = 201,
        };
    }

    [HttpDelete]
    [Route("{projectId}")]
    public async Task<ActionResult<List<Project>>> Delete(Guid projectId)
    {
        // Ensure project exists
        Project? project = await projectService.Get(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Project_Delete_NoProjectExistsWithId, $"No project exists with id: {projectId}")
            ));
        }

        await projectService.Delete(project);

        logger.LogInformation("Successfully deleted project with id: {projectId}", project.Id);

        return new OkObjectResult(project);
    }

    [HttpGet]
    [Route("{projectId}")]
    public async Task<ActionResult<List<Project>>> Get(Guid projectId)
    {
        // Ensure project exists
        Project? project = await projectService.Get(projectId);
        if (project == null)
        {
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Project_Get_NoProjectExistsWithId, $"No project exists with id: {projectId}")
            ));
        }

        logger.LogInformation("Successfully looked up project with id: {projectId}", project.Id);

        return new OkObjectResult(project);
    }

    [HttpGet]
    [Route("")]
    public async Task<ActionResult<List<Project>>> GetAll()
    {
        List<Project> allProjects = await projectService.GetAll();
        logger.LogInformation("Successfully looked up {numProjects} projects", allProjects.Count);

        return new OkObjectResult(allProjects);
    }

    [HttpPut]
    [Route("{projectId}")]
    public async Task<ActionResult<Project>> Save(Guid projectId, [FromBody] SaveProjectDto dto)
    {
        // Ensure project exists
        Project? project = await projectService.Get(projectId);
        if (project == null)
        {
            // Immediately serve not-found (no validation errors)
            return new NotFoundObjectResult(new ApiError(
                errors: new GenericError(ErrorId.Project_Save_NoProjectExistsWithId, $"No project exists with id: {projectId}")
            ));
        }

        // Process DTO
        string name = dto.Name.Trim();

        // Update project model
        project.Name = name;
        Project updatedProject = await projectService.Save(project);

        logger.LogInformation("Successfully updated project with id: {projectId}", projectId);

        return new OkObjectResult(updatedProject);
    }
}