using System.ComponentModel.DataAnnotations;

namespace MyProject.Web;

// @NOTE mostly taken from https://github.com/dotnet/runtime/blob/main/src/libraries/System.ComponentModel.Annotations/src/System/ComponentModel/DataAnnotations/RequiredAttribute.cs

/// <summary>
/// Validation attribute to indicate that a property field or parameter is optional but, if supplied, cannot be empty.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter, AllowMultiple = false)]
public class OptionalNotEmptyAttribute : ValidationAttribute
{
    public OptionalNotEmptyAttribute() : base(() => "The {0} field cannot be empty.") { }

    /// <summary>
    /// Override of <see cref="ValidationAttribute.IsValid(object)" />
    /// </summary>
    /// <param name="value">The value to test</param>
    /// <returns>
    /// <c>false</c> if <paramref name="value" /> is a empty / whitespace-only string,
    /// otherwise <c>true</c>.
    /// </returns>
    public override bool IsValid(object? value)
    {
        if (value is string stringValue && string.IsNullOrWhiteSpace(stringValue))
        {
            return false;
        }
        else
        {
            return true;
        }
    }
}
