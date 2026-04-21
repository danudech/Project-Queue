
using Queue.Application.DTO.Request;

namespace Queue.Application.Interfaces;

public interface IUsers
{
    Task<RegisterResponse?> LocalRegister(RegisterRequest data, string ip, string userAgent, CancellationToken ct);
    Task<bool> ConfirmEmail(string token, CancellationToken ct);
}
