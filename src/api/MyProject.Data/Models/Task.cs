using Amazon.DynamoDBv2.DataModel;

namespace MyProject.Data.Models;

public class Task : ModelBase<Guid>
{
    [DynamoDBHashKey("id")]
    public Guid Id { get; set; }

    [DynamoDBProperty("description")]
    public string Description { get; set; }

    [DynamoDBProperty("isDone")]
    public bool IsDone { get; set; }
}
