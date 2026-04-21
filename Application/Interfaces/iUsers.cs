
using Queue.Application.DTO.Request;

namespace Queue.Application.Interfaces;

public interface IUsers
{
    Task<RegisterResponse?> LocalRegister(RegisterRequest data, string ip, string userAgent, CancellationToken ct);
    Task ResentConfirmationEmail(RegisterRequest data, string ip, string userAgent, CancellationToken ct);
    Task<bool?> ConfirmEmail(VerifyAccountRequest data, string ip, string userAgent, CancellationToken ct);
}
