using Amazon.DynamoDBv2.DataModel;

namespace MyProject.Data.Models;

[DynamoDBTable("projects")]
public class Project : ModelBase<Guid>
{
    [DynamoDBHashKey("id")]
    public Guid Id { get; set; }

    [DynamoDBProperty("name")]
    public string Name { get; set; }

    [DynamoDBProperty("tasks")]
    public List<Task> Tasks { get; set; }
}