using Microsoft.AspNetCore.Mvc;

namespace MyProject.Web
{
    public class ValidationErrorResult : BadRequestObjectResult
    {
        // C# can't call a base constructor in the middle of a constructor but it can do _this_?
        public ValidationErrorResult(List<ErrorModel> errors) : base(ProcessErrors(errors)) { }

        private static ErrorModel ProcessErrors(List<ErrorModel> errors)
        {
            // Construct formal API error
            ApiError response = new ApiError(message: errors.Count == 1 ?
                $"There was a validation error in your request" :
                $"There were {errors.Count} validation errors in your request",
                errors: errors);

            return response;
        }
    }
}