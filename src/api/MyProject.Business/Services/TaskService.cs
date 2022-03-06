using MyProject.Data;
using MyProject.Data.Models;

namespace MyProject.Business.Services;

public class TaskService
{
    private DynamoDBRepository<Project, Guid> projectRepo;

    public TaskService(DynamoDBRepository<Project, Guid> projectRepo)
    {
        this.projectRepo = projectRepo;
    }

    public async Task<Data.Models.Task> Create(Project project, string description)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            throw new ArgumentException($"Cannot create task - '{nameof(description)}' cannot be null", nameof(description));
        }

        Data.Models.Task newTask = new Data.Models.Task
        {
            Id = Guid.NewGuid(),
            Description = description,
            IsDone = false,
        };
        project.Tasks.Add(newTask);

        await projectRepo.Save(project);

        return newTask;
    }

    public Task<Data.Models.Task?> Get(Project project, Guid id)
    {
        return System.Threading.Tasks.Task.FromResult(project.Tasks.SingleOrDefault((task) => task.Id == id));
    }

    public Task<List<Data.Models.Task>> GetAll(Project project)
    {
        return System.Threading.Tasks.Task.FromResult(project.Tasks);
    }

    public async Task<Data.Models.Task> Save(Project project, Data.Models.Task task)
    {
        var existingTaskIndex = project.Tasks.FindIndex((existingTask) => existingTask.Id == task.Id);
        if (existingTaskIndex == -1)
        {
            // Insert new row
            project.Tasks.Add(task);
        }
        else
        {
            // Update existing record
            project.Tasks[existingTaskIndex] = task;
        }

        await projectRepo.Save(project);

        return task;
    }

    public async Task<Data.Models.Task> Delete(Project project, Guid id)
    {
        Data.Models.Task? existingTask = await Get(project, id);
        if (existingTask == null)
        {
            throw new InvalidOperationException($"Cannot delete - no task exists with id {id} in project with id '{project.Id}'");
        }

        project.Tasks.Remove(existingTask);
        await projectRepo.Save(project);

        return existingTask;
    }

    public Task<Data.Models.Task> Delete(Project project, Data.Models.Task task)
    {
        return Delete(project, task.Id);
    }
}