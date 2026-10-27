using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface IPlatformAdminService
{
    Task<AdminOverviewResponse> GetOverviewAsync(CancellationToken ct = default);
    Task<List<AdminShopDto>> GetShopsAsync(CancellationToken ct = default);
    Task<AdminShopDto> CreateShopAsync(CreateShopAdminRequest req, CancellationToken ct = default);
    Task<bool> UpdateShopStatusAsync(int id, string status, CancellationToken ct = default);
    Task<List<AdminUserDto>> GetUsersAsync(CancellationToken ct = default);
    Task<AdminUserDto> CreateUserAsync(CreateUserAdminRequest req, CancellationToken ct = default);
    Task<bool> UpdateUserStatusAsync(int id, string status, CancellationToken ct = default);
    Task<List<AdminOperationDto>> GetOperationsAsync(CancellationToken ct = default);
    Task<List<AdminAuditDto>> GetAuditLogsAsync(CancellationToken ct = default);
    Task<List<AdminSettingDto>> GetSettingsAsync(CancellationToken ct = default);
    Task<bool> SaveSettingAsync(UpdateSettingAdminRequest req, CancellationToken ct = default);
}
