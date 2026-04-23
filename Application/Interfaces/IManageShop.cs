
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface IManageShop
{
    Task<ShopResponse?> GetShopById(int userId,string ip, string userAgent, CancellationToken ct);
}
