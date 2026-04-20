using Serilog;
using Queue.Application.Interfaces;

namespace Queue.Infrastructure.Repositories;
public sealed class ActionLog : IActionLog
{
   private readonly Serilog.ILogger _logger = Log.ForContext("LogSet", "Custom");
   public void Info(string message, params object[] args) => _logger.Information(message, args);
   public void Warning(string message, params object[] args) => _logger.Warning(message, args);
   public void Error(Exception ex, string message, params object[] args) => _logger.Error(ex, message, args);
}
