using System.ComponentModel.DataAnnotations;

namespace MyProject.Web.Controllers;

public class SaveProjectDto
{
    [Required(ErrorMessage = "Field must be a non-empty string")]
    public string Name { get; set; }
}
