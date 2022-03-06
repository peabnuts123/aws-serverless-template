using System.ComponentModel.DataAnnotations;

namespace MyProject.Web.Controllers;

public class CreateTaskDto
{
    [Required(ErrorMessage = "Field must be a non-empty string")]
    public string Description { get; set; }
}
