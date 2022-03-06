using System.Text.Json.Serialization;
using Amazon.DynamoDBv2.DataModel;

namespace MyProject.Data.Models;

public abstract class ModelBase<TPrimaryKey>
{
    [JsonIgnore]
    public TPrimaryKey? PrimaryKey
    {
        get
        {
            var properties = this.GetType().GetProperties();
            foreach (var property in properties)
            {
                var hashKeyAttributes = property.GetCustomAttributes(typeof(DynamoDBHashKeyAttribute), true);
                if (hashKeyAttributes.Length > 0)
                {
                    var value = (TPrimaryKey?)property.GetValue(this);
                    if (value != null)
                    {
                        return value;
                    }
                    else
                    {
                        throw new NullReferenceException("Primary key is null");
                    }
                }
            }

            throw new MissingFieldException($"Class '{GetType().Name}' has no property marked with [DynamoDBHashKey] attribute");
        }
    }
}