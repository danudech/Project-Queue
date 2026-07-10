
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface IUsers
{
    Task<RegisterResponse?> LocalRegister(RegisterRequest data, string originUrl, string ip, string userAgent, CancellationToken ct);
    Task<UserResponse?> GetUserById(int userId,string ip, string userAgent, CancellationToken ct);
    Task GetForgotPasswordRequestByEmail(ForgotPasswordRequest data, string originUrl, string ip, string userAgent, CancellationToken ct);
    Task ResentConfirmationEmail(RegisterRequest data, string originUrl, string ip, string userAgent, CancellationToken ct);
    Task<bool?> ConfirmEmail(VerifyAccountRequest data, string ip, string userAgent, CancellationToken ct);
    Task<bool?> ResetPassword(int userId, string newPassword, string ip, string userAgent, CancellationToken ct);
}
