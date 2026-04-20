using System.Threading;
using System.Threading.Tasks;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;
public interface IAuthentication
{
   Task<LoginResponse?> Login(string EmailOrPhone, string password, string ip, string userAgent, CancellationToken ct);
}
