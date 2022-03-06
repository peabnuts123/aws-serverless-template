using Microsoft.AspNetCore.Mvc;
using MyProject.Business.Services;
using MyProject.Data.Models;

namespace MyProject.Web.Controllers;

[ApiController]
[Route("api/debug")]
public class DebugController : ControllerBase
{
    private readonly ILogger<DebugController> logger;
    private readonly ProjectService projectService;

    public DebugController(ILogger<DebugController> logger, ProjectService projectService)
    {
        this.logger = logger;
        this.projectService = projectService;
    }

    [HttpPost]
    [Route("seed-mock-data")]
    public async Task<ActionResult<IList<Project>>> SeedMockData()
    {
        List<Project> mockData = new List<Project> {
            new Project {
                Id = Guid.Parse("d584b97d-41c1-4396-89be-afd8bb254742"),
                Name = "My fancy project",
                Tasks = new List<Data.Models.Task> {
                    new Data.Models.Task {
                        Id = Guid.Parse("211c3f8e-2285-4dad-8cbc-4db141d20caf"),
                        Description = "Go for a 10 minute walk",
                        IsDone = false,
                    },
                    new Data.Models.Task {
                        Id = Guid.Parse("bc54f2c6-a4d3-430d-87f3-e86ec3163ce8"),
                        Description = "Hang up photographs",
                        IsDone = false,
                    },
                },
            },
            new Project {
                Id = Guid.Parse("43de3da1-bb1e-4863-9eba-fcb86316e672"),
                Name = "Rooms that need vacuuming",
                Tasks = new List<Data.Models.Task> {
                    new Data.Models.Task {
                        Id = Guid.Parse("04980f53-f81d-4494-ac8b-d7c43f22ef95"),
                        Description = "Kitchen",
                        IsDone = true,
                    },
                    new Data.Models.Task {
                        Id = Guid.Parse("d5974009-066d-4795-891e-b6481b7f0826"),
                        Description = "Bedroom",
                        IsDone = false,
                    },
                    new Data.Models.Task {
                        Id = Guid.Parse("ebfa03ec-8c8e-4539-94c9-f2237133b7df"),
                        Description = "Bathroom",
                        IsDone = false,
                    },
                    new Data.Models.Task {
                        Id = Guid.Parse("8e019d1d-f58d-4430-8851-4c5ff34c6cc6"),
                        Description = "Dining Room",
                        IsDone = false,
                    },
                },
            },
        };

        foreach (var project in mockData)
        {
            await projectService.Save(project);
        }

        logger.LogInformation("Successfully seeded database with {numProjects} mock projects", mockData.Count);

        return new StatusCodeResult(statusCode: 204);
    }
}