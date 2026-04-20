using System;

namespace Queue.Api.Models.Response;

public sealed class ApiResponse<T>
{
    public bool Status { get; set; }
    public string Message { get; set; } = "";
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "ok")=> new() { Status = true, Message = message, Data = data };
    public static ApiResponse<T> Fail(string message)=> new() { Status = false, Message = message, Data = default };
}
