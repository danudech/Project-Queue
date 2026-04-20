namespace Queue.Application.Interfaces;
public interface IActionLog
{
   void Info(string message, params object[] args);
   void Warning(string message, params object[] args);
   void Error(Exception ex, string message, params object[] args);
}
