using System.ComponentModel.DataAnnotations;

namespace MyProject.Web.Controllers;

public class CreateProjectDto
{
    [Required(ErrorMessage = "Field must be a non-empty string")]
    public string Name { get; set; }
}
