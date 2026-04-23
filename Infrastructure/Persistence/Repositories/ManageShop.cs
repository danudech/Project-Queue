using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Service;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class ManageShop : IManageShop
{
    private readonly IActionLog _actionLog;
    private readonly QueueDbContext _db;
    private readonly ICrudService _crud;
    private readonly IConfiguration _config;


    public ManageShop(IActionLog actionLog, QueueDbContext db, ICrudService crud, IConfiguration config)

    {
        _actionLog = actionLog;
        _db = db;
        _config = config;
        _crud = crud;

    }

    public async Task<ShopResponse?> GetShopById(int userId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching shop data (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);

            Shop? shop = await _db.Shops
                .AsNoTracking()
                .Include(s => s.Status)
                .Include(s => s.ShopBusinessHours)
                .Include(s => s.ShopHolidays)
                .Include(s => s.ShopBranches)
                    .ThenInclude(b => b.Address)
                        .ThenInclude(a => a.Subdistrict)
                            .ThenInclude(sd => sd.District)
                                .ThenInclude(d => d.Province)
                .FirstOrDefaultAsync(s => s.OwnerId == userId, ct);

            if (shop == null)
            {
                _actionLog.Warning("Shop not found (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
                return null;
            }

            return MapToResponse(shop);
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error fetching shop data (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            return null;
        }
    }

    private static ShopResponse MapToResponse(Shop shop) => new()
    {
        Id = shop.Id,
        Name = shop.Name ?? string.Empty,
        OwnerId = shop.OwnerId,
        Status = shop.StatusId,

        ShopBranches = shop.ShopBranches?.Select(b => new BranchDto
        {
            Id = b.Id,
            Guid = b.Guid,
            Name = b.Name ?? string.Empty,
            Phone = b.Phone ?? string.Empty,
            Address = MapAddress(b.Address)
        }).ToList() ?? new(),

        ShopHours = shop.ShopBusinessHours?.Select(h => new ShopBusinessHour
        {
            DayOfWeek = h.DayOfWeek,
            OpenTime = h.OpenTime,
            CloseTime = h.CloseTime
        }).OrderBy(h => h.DayOfWeek).ToList() ?? new(),

        ShopHolidays = shop.ShopHolidays?.Select(h => new ShopHoliday
        {
            HolidayDate = h.HolidayDate,
            Reason = h.Reason ?? string.Empty
        }).OrderBy(h => h.HolidayDate).ToList() ?? new()
    };

    private static AddressDto? MapAddress(Address? address)
    {
        if (address == null) return null;

        Subdistrict? subdistrict = address.Subdistrict;
        District? district = subdistrict?.District;
        return new AddressDto
        {
            HouseNo = address.HouseNo ?? string.Empty,
            Street = address.Street ?? string.Empty,
            Subdistrict = subdistrict?.NameTh ?? string.Empty,
            District = district?.NameTh ?? string.Empty,
            Province = district?.Province?.NameTh ?? string.Empty,
            Zipcode = address.Zipcode ?? string.Empty
        };
    }
}