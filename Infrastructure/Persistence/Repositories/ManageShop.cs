using System.Runtime.InteropServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Queue.Application.DTO.Request;
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

    public async Task<List<MasterStatus>> MasterShopType(int? typeid, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching shop type (TypeId={TypeId}, IP={IP}, UserAgent={UserAgent})", typeid ?? 0, ip, userAgent);
            List<MasterStatus> ShopTypeResponsd = new List<MasterStatus>();
            if (typeid == null)
            {

                ShopTypeResponsd = await _db.MasterStatuses
                .Where(ms => ms.Type == "SHOP_TYPE" && ms.IsActive)
                .AsNoTracking()
                .ToListAsync(ct);
            }
            else
            {
                ShopTypeResponsd = await _db.MasterStatuses
                    .Where(ms => ms.Id == typeid && ms.Type == "SHOP_TYPE" && ms.IsActive)
                    .AsNoTracking()
                    .ToListAsync(ct);
            }

            return ShopTypeResponsd.Select(st => new MasterStatus
            {
                Id = st.Id,
                NameTh = st.NameTh ?? string.Empty,
                NameEn = st.NameEn ?? string.Empty,
                IsActive = st.IsActive
            }).ToList();
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error fetching shop type (TypeId={TypeId}, IP={IP}, UserAgent={UserAgent})", typeid ?? 0, ip, userAgent);
            return new List<MasterStatus>();
        }
    }

    public async Task<ShopResponse?> CreateShop(int userId, CreateShopRequest request, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Creating new shop (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            Shop newShop = new Shop
            {
                Name = request.ShopName,
                OwnerId = userId,
                TypeId = int.Parse(request.ShopType),
                StatusId = 3,
            };
            await _crud.InsertAsync(newShop, ct);

            Address newAddress = new Address
            {
                HouseNo = request.Branch?.BranchAddress?.HouseNo ?? string.Empty,
                Street = request.Branch?.BranchAddress?.Street ?? string.Empty,
                ProvinceId = request.Branch?.BranchAddress?.ProvinceId ?? 0,
                DistrictId = request.Branch?.BranchAddress?.DistrictId ?? 0,
                SubdistrictId = request.Branch?.BranchAddress?.SubdistrictId ?? 0,
                Zipcode = request.Branch?.BranchAddress?.Zipcode ?? string.Empty
            };
            await _crud.InsertAsync(newAddress, ct);

            ShopBranch newBranch = new ShopBranch
            {
                Guid = Guid.NewGuid(),
                ShopId = newShop.Id,
                Name = request.Branch?.BranchName ?? "Main Branch",
                Phone = request.Branch?.BranchPhone ?? string.Empty,
                AddressId = newAddress.Id
            };
            await _crud.InsertAsync(newBranch, ct);
            List<ShopBusinessHour> businessHours = request.BusinessHours.Select(h => new ShopBusinessHour
            {
                ShopId = newShop.Id,
                BranchId = newBranch.Id,
                DayOfWeek = h.DayOfWeek,
                OpenTime = TimeOnly.Parse(h.OpenTime),
                CloseTime = TimeOnly.Parse(h.CloseTime),
            }).ToList();

            await _crud.InsertRangeAsync(businessHours, ct);

            await transaction.CommitAsync(ct);

            return MapToResponse(newShop);
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error creating shop (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            await transaction.RollbackAsync(ct);
            return null;
        }
    }

    public async Task<ShopResponse?> CreateBranch(int userId, CreateShopRequest request, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Creating new branch (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
        await using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            Shop? shop = await _db.Shops.FirstOrDefaultAsync(s => s.OwnerId == userId, ct);
            if (shop == null)
            {
                _actionLog.Warning("Shop not found for branch creation (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
                return null;
            }

            Address newAddress = new Address
            {
                HouseNo = request.Branch?.BranchAddress?.HouseNo ?? string.Empty,
                Street = request.Branch?.BranchAddress?.Street ?? string.Empty,
                ProvinceId = request.Branch?.BranchAddress?.ProvinceId ?? 0,
                DistrictId = request.Branch?.BranchAddress?.DistrictId ?? 0,
                SubdistrictId = request.Branch?.BranchAddress?.SubdistrictId ?? 0,
                Zipcode = request.Branch?.BranchAddress?.Zipcode ?? string.Empty
            };
            await _crud.InsertAsync(newAddress, ct);

            ShopBranch newBranch = new ShopBranch
            {
                Guid = Guid.NewGuid(),
                ShopId = shop.Id,
                Name = request.Branch?.BranchName ?? "New Branch",
                Phone = request.Branch?.BranchPhone ?? string.Empty,
                AddressId = newAddress.Id
            };
            await _crud.InsertAsync(newBranch, ct);
            List<ShopBusinessHour> businessHours = request.BusinessHours.Select(h => new ShopBusinessHour
            {
                ShopId = shop.Id,
                BranchId = newBranch.Id,
                DayOfWeek = h.DayOfWeek,
                OpenTime = TimeOnly.Parse(h.OpenTime),
                CloseTime = TimeOnly.Parse(h.CloseTime),
            }).ToList();

            await _crud.InsertRangeAsync(businessHours, ct);

            await transaction.CommitAsync(ct);

            return MapToResponse(shop);
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error creating branch (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            await transaction.RollbackAsync(ct);
            return null;
        }
    }


    // ================= Private Helper Methods =================

    private static ShopResponse MapToResponse(Shop shop) => new()
    {
        Id = shop.Id,
        Name = shop.Name ?? string.Empty,
        Type = shop.TypeId.ToString() ?? string.Empty,
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