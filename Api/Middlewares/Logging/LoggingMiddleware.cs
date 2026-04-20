using System;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Queue.Api.Middlewares.Logging;

public sealed class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoggingMiddleware> _logger;

    public LoggingMiddleware(RequestDelegate next, ILogger<LoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        var user = context.User?.Identity?.Name ?? "anonymous";
        try
        {
            await _next(context);
            sw.Stop();
            _logger.LogInformation("HTTP {Method} {Path} => {StatusCode} | User={User} | {Elapsed}ms",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                user,
                sw.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ERROR {Method} {Path} | User={User}",
                context.Request.Method, context.Request.Path, user);
            throw;
        }
    }
}
