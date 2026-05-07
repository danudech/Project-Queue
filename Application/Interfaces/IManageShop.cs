
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Domain.Entities;

namespace Queue.Application.Interfaces;

public interface IManageShop
{
    Task<ShopResponse?> GetShopById(int userId, string ip, string userAgent, CancellationToken ct);
    Task<List<MasterStatus>> MasterShopType(int? typeid, string ip, string userAgent, CancellationToken ct);
    Task<ShopResponse?> CreateShop(int userId, CreateShopRequest request, string ip, string userAgent, CancellationToken ct);
    Task<ShopResponse?> CreateBranch(int userId, CreateShopRequest request, string ip, string userAgent, CancellationToken ct);
    Task<List<ShopCategoryResponse>?> GetShopCategoryById(int userId, string ip, string userAgent, CancellationToken ct);
    Task<ShopCategoryResponse> AddShopCategory(int userId, ShopCategoryRequest request, string ip, string userAgent, CancellationToken ct);
    Task<ShopCategoryResponse> UpdateShopCategory(int userId, ShopCategoryRequest request, string ip, string userAgent, CancellationToken ct);
    Task<bool> DeleteShopCategory(int userId, int categoryId, string ip, string userAgent, CancellationToken ct);
    Task<List<ShopServiceResponse>?> GetShopServicesById(int userId, string ip, string userAgent, CancellationToken ct);
    Task<ShopServiceResponse> AddShopService(int userId, ShopServiceRequest request, string ip, string userAgent, CancellationToken ct);
    Task<ShopServiceResponse> UpdateShopService(int userId, ShopServiceRequest request, string ip, string userAgent, CancellationToken ct);
    Task<bool> DeleteShopService(int userId, int serviceId, string ip, string userAgent, CancellationToken ct);
}
