namespace Queue.Application.Interfaces;

public interface IEmailService
{
    Task SendConfirmationEmailAsync(string toEmail, string userName, string confirmationLink);
    Task SendPasswordEmailAsync(string toEmail, string userName, string password);
    Task SendEmailAsync(string toEmail, string subject, string body);
}