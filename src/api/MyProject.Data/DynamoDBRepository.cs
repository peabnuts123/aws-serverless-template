using Amazon.DynamoDBv2.DataModel;
using MyProject.Data.Models;
using Task = System.Threading.Tasks.Task;

namespace MyProject.Data;

public class DynamoDBRepository<TModel, TPrimaryKey> where TModel : ModelBase<TPrimaryKey>
{
    private DynamoDBContext context { get; set; }

    public DynamoDBRepository(DynamoDBContext context)
    {
        this.context = context;
    }

    public async Task Save(params TModel[] models)
    {
        if (models.Length == 0)
        {
            // @NOTE no-op
            return;
        }
        else if (models.Length == 1)
        {
            // Save a single model
            TModel model = models[0];
            await context.SaveAsync(model);
        }
        else
        {
            // Save many models
            var query = context.CreateBatchWrite<TModel>();
            query.AddPutItems(models);
            await query.ExecuteAsync();
        }
    }

    public async Task<TModel?> Get(TPrimaryKey primaryKey)
    {
        return await context.LoadAsync<TModel>(primaryKey);
    }

    public async Task<List<TModel>> GetAll()
    {
        var results = await context.ScanAsync<TModel>(Array.Empty<ScanCondition>()).GetRemainingAsync();
        return results!;
    }

    public async Task DeleteByKey(params TPrimaryKey[] primaryKeys)
    {

        if (primaryKeys.Length == 0)
        {
            // @NOTE no-op
            return;
        }
        else if (primaryKeys.Length == 1)
        {
            // Delete a single model
            var primaryKey = primaryKeys[0];
            await context.DeleteAsync<TModel>(primaryKey);
        }
        else
        {
            // Delete many models
            var query = context.CreateBatchWrite<TModel>();
            foreach (var primaryKey in primaryKeys)
            {
                query.AddDeleteKey(primaryKey);
            }
            await query.ExecuteAsync();
        }
    }

    public async Task Delete(params TModel[] models)
    {
        if (models.Length == 0)
        {
            // @NOTE no-op
            return;
        }
        else if (models.Length == 1)
        {
            // Delete a single model
            var model = models[0];
            await context.DeleteAsync<TModel>(model);
        }
        else
        {
            // Delete many models
            var query = context.CreateBatchWrite<TModel>();
            query.AddDeleteItems(models);
            await query.ExecuteAsync();
        }
    }

    public async Task<List<TModel>> Where(params ScanCondition[] conditions)
    {
        var result = await context.ScanAsync<TModel>(conditions).GetRemainingAsync();
        return result!;
    }

    public Task<TResult> Raw<TResult>(Func<DynamoDBContext, Task<TResult>> requestFunc)
    {
        return requestFunc(context);
    }
}