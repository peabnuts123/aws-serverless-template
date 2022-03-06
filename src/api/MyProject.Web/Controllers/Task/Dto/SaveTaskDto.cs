namespace MyProject.Web.Controllers;

public class SaveTaskDto
{
    [OptionalNotEmpty(ErrorMessage = "Field must be a non-empty string, if supplied")]
    public string? Description { get; set; }
    public bool? IsDone { get; set; }
}
