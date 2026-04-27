
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Domain.Entities;

namespace Queue.Application.Interfaces;

public interface IManageShop
{
    Task<ShopResponse?> GetShopById(int userId,string ip, string userAgent, CancellationToken ct);
    Task<List<MasterStatus>> MasterShopType(int? typeid, string ip, string userAgent, CancellationToken ct);
}
