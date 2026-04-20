
using Queue.Application.DTO.Request;

namespace Queue.Application.Interfaces;

public interface IUsers
{
    Task<RegisterResponse?> Register(RegisterRequest data, string ip, string userAgent, CancellationToken ct);
}
