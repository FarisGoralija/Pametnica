namespace backend.Models;

public record ServiceResult<T>(bool Success, T? Data, string? Error = null, int? StatusCode = null)
{
    public static ServiceResult<T> Ok(T data) => new(true, data);
    public static ServiceResult<T> Fail(string error, int? statusCode = null) => new(false, default, error, statusCode);
}
