using System.Runtime.InteropServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Queue.Application.DTO.Request;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Service;
using Queue.Infrastructure.Services;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class ManageShop : IManageShop
{
    private readonly IActionLog _actionLog;
    private readonly QueueDbContext _db;
    private readonly ICrudService _crud;
    private readonly IConfiguration _config;
    private readonly DateTimeService _dateTime;


    public ManageShop(IActionLog actionLog, QueueDbContext db, ICrudService crud, IConfiguration config, DateTimeService dateTime)

    {
        _actionLog = actionLog;
        _db = db;
        _config = config;
        _dateTime = dateTime;
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
                CreatedAt = _dateTime.LocalNow()
            };
            await _crud.InsertAsync(newShop, ct);

            Address newAddress = new Address
            {
                HouseNo = request.Branch?.BranchAddress?.HouseNo ?? string.Empty,
                Street = request.Branch?.BranchAddress?.Street ?? string.Empty,
                ProvinceId = request.Branch?.BranchAddress?.ProvinceId ?? 0,
                DistrictId = request.Branch?.BranchAddress?.DistrictId ?? 0,
                SubdistrictId = request.Branch?.BranchAddress?.SubdistrictId ?? 0,
                Zipcode = request.Branch?.BranchAddress?.Zipcode ?? string.Empty,
                CreatedAt = _dateTime.LocalNow()
            };
            await _crud.InsertAsync(newAddress, ct);

            ShopBranch newBranch = new ShopBranch
            {
                Guid = Guid.NewGuid(),
                ShopId = newShop.Id,
                Name = request.Branch?.BranchName ?? "Main Branch",
                Phone = request.Branch?.BranchPhone ?? string.Empty,
                AddressId = newAddress.Id,
                CreatedAt = _dateTime.LocalNow()
            };
            await _crud.InsertAsync(newBranch, ct);
            List<ShopBusinessHour> businessHours = request.BusinessHours.Select(h => new ShopBusinessHour
            {
                ShopId = newShop.Id,
                BranchId = newBranch.Id,
                DayOfWeek = h.DayOfWeek,
                OpenTime = TimeOnly.Parse(h.OpenTime),
                CloseTime = TimeOnly.Parse(h.CloseTime),
                CreatedAt = _dateTime.LocalNow()
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
                Zipcode = request.Branch?.BranchAddress?.Zipcode ?? string.Empty,
                CreatedAt = _dateTime.LocalNow()
            };
            await _crud.InsertAsync(newAddress, ct);

            ShopBranch newBranch = new ShopBranch
            {
                Guid = Guid.NewGuid(),
                ShopId = shop.Id,
                Name = request.Branch?.BranchName ?? "New Branch",
                Phone = request.Branch?.BranchPhone ?? string.Empty,
                AddressId = newAddress.Id,
                CreatedAt = _dateTime.LocalNow()
            };
            await _crud.InsertAsync(newBranch, ct);
            List<ShopBusinessHour> businessHours = request.BusinessHours.Select(h => new ShopBusinessHour
            {
                ShopId = shop.Id,
                BranchId = newBranch.Id,
                DayOfWeek = h.DayOfWeek,
                OpenTime = TimeOnly.Parse(h.OpenTime),
                CloseTime = TimeOnly.Parse(h.CloseTime),
                CreatedAt = _dateTime.LocalNow()
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

    public async Task<List<ShopCategoryResponse>?> GetShopCategoryById(int userId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching shop categories (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);

            List<ServiceCategory>? categories = await _db.ServiceCategories
                .Where(c => c.Shop.OwnerId == userId)
                .Include(c => c.Shop)
                .AsNoTracking()
                .ToListAsync(ct);

            return categories?.Select(c => new ShopCategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                ShopId = c.ShopId,
                ShopName = c.Shop?.Name ?? string.Empty,
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            }).ToList();
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error fetching shop categories (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            return null;
        }
    }

    public async Task<ShopCategoryResponse> AddShopCategory(int userId, ShopCategoryRequest request, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Adding shop category (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
        try
        {
            Shop? shop = await _db.Shops.FirstOrDefaultAsync(s => s.OwnerId == userId, ct);
            if (shop == null)
            {
                _actionLog.Warning("Shop not found for adding category (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
                return null!;
            }

            ServiceCategory? existingCategory = await _db.ServiceCategories
                .FirstOrDefaultAsync(c => c.ShopId == shop.Id && c.Name == request.Name, ct);

            if (existingCategory != null)
            {
                _actionLog.Warning("Category already exists (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
                return null!;
            }

            ServiceCategory newCategory = new ServiceCategory
            {
                Name = request.Name,
                ShopId = shop.Id,
                IsActive = request.IsActive,
                CreatedAt = _dateTime.LocalNow()
            };

            await _crud.InsertAsync(newCategory, ct);

            return new ShopCategoryResponse
            {
                Id = newCategory.Id,
                Name = newCategory.Name,
                ShopId = newCategory.ShopId,
                ShopName = shop.Name ?? string.Empty,
                IsActive = newCategory.IsActive,
                CreatedAt = _dateTime.LocalNow()
            };
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error adding shop category (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            return null!;
        }
    }

    public async Task<ShopCategoryResponse> UpdateShopCategory(int userId, ShopCategoryRequest request, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Updating shop category (UserId={UserId}, CategoryId={CategoryId}, IP={IP}, UserAgent={UserAgent})", userId, request.Id ?? 0, ip, userAgent);
        try
        {
            ServiceCategory? category = await _db.ServiceCategories
                .Include(c => c.Shop)
                .FirstOrDefaultAsync(c => c.Id == request.Id && c.Shop.OwnerId == userId, ct);

            if (category == null)
            {
                _actionLog.Warning("Category not found for update (UserId={UserId}, CategoryId={CategoryId}, IP={IP}, UserAgent={UserAgent})", userId, request.Id ?? 0, ip, userAgent);
                return null!;
            }

            if (category.Name != request.Name) category.Name = request.Name;
            if (category.IsActive != request.IsActive) category.IsActive = request.IsActive;
            category.UpdatedAt = _dateTime.LocalNow();
            category.UpdatedBy = userId;

            await _crud.UpdateAsync(category, ct);

            return new ShopCategoryResponse
            {
                Id = category.Id,
                Name = category.Name,
                ShopId = category.ShopId,
                ShopName = category.Shop?.Name ?? string.Empty,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error updating shop category (UserId={UserId}, CategoryId={CategoryId}, IP={IP}, UserAgent={UserAgent})", userId, request.Id ?? 0, ip, userAgent);
            return null!;
        }
    }

    public async Task<bool> DeleteShopCategory(int userId, int categoryId, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Deleting shop category (UserId={UserId}, CategoryId={CategoryId}, IP={IP}, UserAgent={UserAgent})", userId, categoryId, ip, userAgent);
        try
        {
            ServiceCategory? category = await _db.ServiceCategories
                .Include(c => c.Shop)
                .FirstOrDefaultAsync(c => c.Id == categoryId && c.Shop.OwnerId == userId, ct);

            if (category == null)
            {
                _actionLog.Warning("Category not found for deletion (UserId={UserId}, CategoryId={CategoryId}, IP={IP}, UserAgent={UserAgent})", userId, categoryId, ip, userAgent);
                return false;
            }

            await _crud.DeleteAsync(category, ct);
            return true;
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error deleting shop category (UserId={UserId}, CategoryId={CategoryId}, IP={IP}, UserAgent={UserAgent})", userId, categoryId, ip, userAgent);
            return false;
        }
    }

    public async Task<List<ShopServiceResponse>?> GetShopServicesById(int userId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching shop services (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);

            List<Domain.Entities.Service>? services = await _db.Services
                .Where(s => s.Shop.OwnerId == userId)
                .Include(s => s.Shop)
                .Include(s => s.ServiceCategoryMaps)
                    .ThenInclude(m => m.Category)
                .AsNoTracking()
                .ToListAsync(ct);

            return services?.Select(s => new ShopServiceResponse
            {
                Id = s.Id,
                Name = s.Name,
                ShopId = s.ShopId,
                ShopName = s.Shop?.Name ?? string.Empty,
                Duration = s.Duration,
                Price = s.Price,
                CategoryId = s.ServiceCategoryMaps.FirstOrDefault()?.CategoryId ?? 0,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            }).ToList();
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error fetching shop services (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            return null;
        }
    }

    public async Task<ShopServiceResponse> AddShopService(int userId, ShopServiceRequest request, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Adding shop service (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
        try
        {
            Shop? shop = await _db.Shops.FirstOrDefaultAsync(s => s.OwnerId == userId, ct);
            if (shop == null)
            {
                _actionLog.Warning("Shop not found for adding service (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
                return null!;
            }

            Domain.Entities.Service newService = new Domain.Entities.Service
            {
                Name = request.Name,
                ShopId = shop.Id,
                Duration = request.Duration,
                Price = request.Price,
                IsActive = request.IsActive,
                CreatedAt = _dateTime.LocalNow(),
                CreatedBy = userId
            };

            await _crud.InsertAsync(newService, ct);

            ServiceCategoryMap _categoryMap = new ServiceCategoryMap
            {
                ServiceId = newService.Id,
                CategoryId = request.CategoryId,
                CreatedAt = _dateTime.LocalNow(),
                CreatedBy = userId
            };
            await _crud.InsertAsync(_categoryMap, ct);

            return new ShopServiceResponse
            {
                Id = newService.Id,
                Name = newService.Name,
                ShopId = newService.ShopId,
                ShopName = shop.Name ?? string.Empty,
                Duration = newService.Duration,
                Price = newService.Price,
                CategoryId = request.CategoryId,
                IsActive = newService.IsActive,
                CreatedAt = newService.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error adding shop service (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            return null!;
        }
    }

    public async Task<ShopServiceResponse> UpdateShopService(int userId, ShopServiceRequest request, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Updating shop service (UserId={UserId}, ServiceId={ServiceId}, IP={IP}, UserAgent={UserAgent})", userId, request.Id ?? 0, ip, userAgent);
        try
        {
            Domain.Entities.Service? service = await _db.Services
                .Include(s => s.Shop)
                .Include(s => s.ServiceCategoryMaps)
                .FirstOrDefaultAsync(s => s.Id == request.Id && s.Shop.OwnerId == userId, ct);

            if (service == null)
            {
                _actionLog.Warning("Service not found for update (UserId={UserId}, ServiceId={ServiceId}, IP={IP}, UserAgent={UserAgent})", userId, request.Id ?? 0, ip, userAgent);
                return null!;
            }

            if (service.Name != request.Name) service.Name = request.Name;
            if (service.Duration != request.Duration) service.Duration = request.Duration;
            if (service.Price != request.Price) service.Price = request.Price;
            if (service.IsActive != request.IsActive) service.IsActive = request.IsActive;
            service.UpdatedAt = _dateTime.LocalNow();
            service.UpdatedBy = userId;

            await _crud.UpdateAsync(service, ct);

            ServiceCategoryMap? categoryMap = service.ServiceCategoryMaps.FirstOrDefault();
            if (categoryMap != null && categoryMap.CategoryId != request.CategoryId)
            {
                categoryMap.CategoryId = request.CategoryId;
                await _crud.UpdateAsync(categoryMap, ct);
            }

            return new ShopServiceResponse
            {
                Id = service.Id,
                Name = service.Name,
                ShopId = service.ShopId,
                ShopName = service.Shop?.Name ?? string.Empty,
                Duration = service.Duration,
                Price = service.Price,
                CategoryId = categoryMap?.CategoryId ?? 0,
                IsActive = service.IsActive,
                CreatedAt = service.CreatedAt
            };
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error updating shop service (UserId={UserId}, ServiceId={ServiceId}, IP={IP}, UserAgent={UserAgent})", userId, request.Id ?? 0, ip, userAgent);
            return null!;
        }
    }

    public async Task<bool> DeleteShopService(int userId, int serviceId, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Deleting shop service (UserId={UserId}, ServiceId={ServiceId}, IP={IP}, UserAgent={UserAgent})", userId, serviceId, ip, userAgent);
        try
        {
            Domain.Entities.Service? service = await _db.Services
                .Include(s => s.Shop)
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.Shop.OwnerId == userId, ct);

            if (service == null)
            {
                _actionLog.Warning("Service not found for deletion (UserId={UserId}, ServiceId={ServiceId}, IP={IP}, UserAgent={UserAgent})", userId, serviceId, ip, userAgent);
                return false;
            }

            ServiceCategoryMap? categoryMap = await _db.ServiceCategoryMaps.FirstOrDefaultAsync(m => m.ServiceId == serviceId, ct);

            if (categoryMap != null) await _crud.DeleteAsync(categoryMap, ct);
            await _crud.DeleteAsync(service, ct);

            return true;
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error deleting shop service (UserId={UserId}, ServiceId={ServiceId}, IP={IP}, UserAgent={UserAgent})", userId, serviceId, ip, userAgent);
            return false;
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