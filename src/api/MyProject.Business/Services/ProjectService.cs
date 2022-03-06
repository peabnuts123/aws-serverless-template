using MyProject.Data;
using MyProject.Data.Models;

namespace MyProject.Business.Services;

public class ProjectService
{
    private DynamoDBRepository<Project, Guid> projectRepo;

    public ProjectService(DynamoDBRepository<Project, Guid> projectRepo)
    {
        this.projectRepo = projectRepo;
    }

    public async Task<Project> Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException($"Cannot create project - '{nameof(name)}' cannot be null", nameof(name));
        }

        Project project = new Project
        {
            Id = Guid.NewGuid(),
            Name = name,
            Tasks = new List<Data.Models.Task>(),
        };

        await projectRepo.Save(project);

        return project;
    }

    public Task<Project?> Get(Guid id)
    {
        return projectRepo.Get(id);
    }

    public Task<List<Project>> GetAll()
    {
        return projectRepo.GetAll();
    }

    public async Task<Project> Save(Project project)
    {
        await projectRepo.Save(project);
        return project;
    }

    public async Task<Project> Delete(Guid id)
    {
        Project? project = await projectRepo.Get(id);
        if (project == null)
        {
            throw new InvalidOperationException($"Cannot delete - no project exists with id {id}");
        }

        await projectRepo.DeleteByKey(id);

        return project;
    }

    public async Task<Project> Delete(Project project)
    {
        await projectRepo.Delete(project);
        return project;
    }
}