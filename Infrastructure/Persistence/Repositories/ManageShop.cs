using System.Runtime.InteropServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Service;
using Queue.Infrastructure.Services;

using Microsoft.Extensions.Hosting;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class ManageShop : IManageShop
{
    private readonly IActionLog _actionLog;
    private readonly QueueDbContext _db;
    private readonly ICrudService _crud;
    private readonly IConfiguration _config;
    private readonly DateTimeService _dateTime;
    private readonly IHostEnvironment _env;

    public ManageShop(IActionLog actionLog, QueueDbContext db, ICrudService crud, IConfiguration config, DateTimeService dateTime, IHostEnvironment env)
    {
        _actionLog = actionLog;
        _db = db;
        _config = config;
        _dateTime = dateTime;
        _crud = crud;
        _env = env;
    }

    public async Task<ShopResponse?> GetShopById(int userId, int BranchId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching shop data (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);

            Shop? shop = await _db.Shops
                .AsNoTracking()
                .Include(s => s.ShopSettings)
                .Include(s => s.Status)
                .Include(s => s.Services)
                .Include(s => s.ShopBranches)
                    .ThenInclude(b => b.Address)
                        .ThenInclude(a => a.Subdistrict)
                            .ThenInclude(sd => sd.District)
                                .ThenInclude(d => d.Province)
                .Include(s => s.ShopBranches)
                    .ThenInclude(b => b.ShopBusinessHours)
                .Include(s => s.ShopBranches)
                    .ThenInclude(b => b.ShopHolidays)
                .FirstOrDefaultAsync(s => s.OwnerId == userId, ct);

            if (shop == null)
            {
                _actionLog.Warning("Shop not found (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
                return null;
            }

            return MapToResponse(shop, BranchId);
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
            // 1. สร้าง Shop หลัก
            Shop newShop = new Shop
            {
                Name = request.ShopName,
                OwnerId = userId,
                TypeId = int.Parse(request.ShopType),
                StatusId = 3, // กำหนดสถานะเริ่มต้น
                IsActive = true,
                CreatedBy = userId,
                CreatedAt = _dateTime.LocalNow()
            };
            await _crud.InsertAsync(newShop, ct);

            // 2. สร้าง Address สำหรับสาขาแรก
            Address newAddress = new Address
            {
                HouseNo = request.Branch?.BranchAddress?.HouseNo ?? string.Empty,
                Street = request.Branch?.BranchAddress?.Street ?? string.Empty,
                ProvinceId = request.Branch?.BranchAddress?.ProvinceId ?? 0,
                DistrictId = request.Branch?.BranchAddress?.DistrictId ?? 0,
                SubdistrictId = request.Branch?.BranchAddress?.SubdistrictId ?? 0,
                Zipcode = request.Branch?.BranchAddress?.Zipcode ?? string.Empty,
                CreatedBy = userId,
                CreatedAt = _dateTime.LocalNow()
            };
            await _crud.InsertAsync(newAddress, ct);

            // 3. สร้าง Branch หลัก
            ShopBranch newBranch = new ShopBranch
            {
                Guid = Guid.NewGuid(),
                ShopId = newShop.Id,
                Name = request.Branch?.BranchName ?? "Main Branch",
                Phone = request.Branch?.BranchPhone ?? string.Empty,
                AddressId = newAddress.Id,
                CreatedBy = userId,
                CreatedAt = _dateTime.LocalNow()
            };
            await _crud.InsertAsync(newBranch, ct);

            // 4. สร้าง Business Hours ผูกกับ Branch
            if (request.BusinessHours != null)
            {
                List<ShopBusinessHour> businessHours = request.BusinessHours.Select(h => new ShopBusinessHour
                {
                    BranchId = newBranch.Id, // อ้างอิงตาม BranchId ใน Schema ใหม่
                    DayOfWeek = h.DayOfWeek,
                    OpenTime = TimeOnly.Parse(h.OpenTime),
                    CloseTime = TimeOnly.Parse(h.CloseTime),
                    CreatedBy = userId,
                    CreatedAt = _dateTime.LocalNow()
                }).ToList();
                await _crud.InsertRangeAsync(businessHours, ct);
            }

            await transaction.CommitAsync(ct);
            return await GetShopById(userId, newBranch.Id, ip, userAgent, ct);
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error creating shop (UserId={UserId})", userId);
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

    public async Task<List<ShopCategoryResponse>?> GetShopCategoryById(int shopId, int? branchId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching shop categories (ShopId={ShopId}, BranchId={BranchId}, IP={IP}, UserAgent={UserAgent})", shopId, branchId ?? 0, ip, userAgent);

            List<ServiceCategory>? categories = await _db.ServiceCategories
                .Where(c => c.ShopId == shopId && (branchId == null || c.BranchId == branchId))
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
            _actionLog.Error(ex, "Error fetching shop categories (ShopId={ShopId}, BranchId={BranchId}, IP={IP}, UserAgent={UserAgent})", shopId, branchId ?? 0, ip, userAgent);
            return null;
        }
    }

    public async Task<ShopCategoryResponse> AddShopCategory(int userId, ShopCategoryRequest request, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            Shop? shop = await _db.Shops.FirstOrDefaultAsync(s => s.OwnerId == userId, ct);
            if (shop == null) return null!;

            ServiceCategory newCategory = new ServiceCategory
            {
                Name = request.Name,
                ShopId = shop.Id,
                BranchId = request.BranchId ?? 0,
                IsActive = request.IsActive,
                CreatedBy = userId,
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
                CreatedAt = newCategory.CreatedAt,
                BranchId = newCategory.BranchId
            };
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error adding category");
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

    public async Task<List<ShopServiceResponse>?> GetShopServicesById(int shopId, int? branchId, int userId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching shop services (UserId={UserId}, ShopId={ShopId}, BranchId={BranchId}, IP={IP}, UserAgent={UserAgent})", userId, shopId, branchId ?? 0, ip, userAgent);

            List<Domain.Entities.Service>? services = await _db.Services
                .Where(s => s.Shop.OwnerId == userId && s.ShopId == shopId && s.BranchId == branchId)
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
                BranchId = request.BranchId ?? 0,
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
                BranchId = newService.BranchId,
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
                BranchId = service.BranchId,
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

    public async Task<ShopResponse?> UpdateShop(int userId, UpdateShopRequest request, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Updating shop (UserId={UserId}, IP={IP})", userId, ip);
        try
        {
            var shop = await _db.Shops
                .Include(s => s.ShopSettings)
                .Include(s => s.Status)
                .Include(s => s.Services)
                .Include(s => s.ShopBranches)
                    .ThenInclude(b => b.Address)
                        .ThenInclude(a => a.Subdistrict)
                            .ThenInclude(sd => sd.District)
                                .ThenInclude(d => d.Province)
                .FirstOrDefaultAsync(s => s.OwnerId == userId, ct);

            if (shop == null) return null;

            bool shopUpdated = false;

            if (request.IsActive.HasValue)
            {
                shop.IsActive = request.IsActive.Value;
                shopUpdated = true;
            }

            if (!string.IsNullOrEmpty(request.Name))
            {
                shop.Name = request.Name;
                shopUpdated = true;
            }

            if (request.TypeId.HasValue)
            {
                shop.TypeId = request.TypeId.Value;
                shopUpdated = true;
            }

            if (shopUpdated)
            {
                shop.UpdatedAt = DateTime.UtcNow;
                await _crud.UpdateAsync(shop, ct);
            }

            if (request.Logo != null && request.Logo.Length > 0)
            {
                var logoSetting = shop.ShopSettings.FirstOrDefault(s => s.Key == "Logo");
                
                // Delete old file
                if (logoSetting != null && !string.IsNullOrEmpty(logoSetting.Value))
                {
                    var oldFilePath = Path.Combine(_env.ContentRootPath, "wwwroot", logoSetting.Value.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "shops");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{request.Logo.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Logo.CopyToAsync(stream, ct);
                }

                var fileUrl = $"/uploads/shops/{uniqueFileName}";

                if (logoSetting == null)
                {
                    logoSetting = new ShopSetting
                    {
                        ShopId = shop.Id,
                        BranchId = request.BranchId > 0 ? request.BranchId : null,
                        Key = "Logo",
                        Value = fileUrl,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = userId
                    };
                    await _crud.InsertAsync(logoSetting, ct);
                }
                else
                {
                    logoSetting.Value = fileUrl;
                    if (request.BranchId > 0) logoSetting.BranchId = request.BranchId;
                    logoSetting.UpdatedAt = DateTime.UtcNow;
                    logoSetting.UpdatedBy = userId;
                    await _crud.UpdateAsync(logoSetting, ct);
                }
            }

            // Update Description if provided
            if (request.Description != null)
            {
                var descSetting = shop.ShopSettings.FirstOrDefault(s => s.Key == "Description");
                if (descSetting == null)
                {
                    await _crud.InsertAsync(new ShopSetting { ShopId = shop.Id, BranchId = request.BranchId > 0 ? request.BranchId : null, Key = "Description", Value = request.Description, CreatedAt = DateTime.UtcNow, CreatedBy = userId }, ct);
                }
                else
                {
                    descSetting.Value = request.Description;
                    if (request.BranchId > 0) descSetting.BranchId = request.BranchId;
                    descSetting.UpdatedAt = DateTime.UtcNow;
                    descSetting.UpdatedBy = userId;
                    await _crud.UpdateAsync(descSetting, ct);
                }
            }

            // Update Email if provided
            if (request.Email != null)
            {
                var emailSetting = shop.ShopSettings.FirstOrDefault(s => s.Key == "Email");
                if (emailSetting == null)
                {
                    await _crud.InsertAsync(new ShopSetting { ShopId = shop.Id, BranchId = request.BranchId > 0 ? request.BranchId : null, Key = "Email", Value = request.Email, CreatedAt = DateTime.UtcNow, CreatedBy = userId }, ct);
                }
                else
                {
                    emailSetting.Value = request.Email;
                    if (request.BranchId > 0) emailSetting.BranchId = request.BranchId;
                    emailSetting.UpdatedAt = DateTime.UtcNow;
                    emailSetting.UpdatedBy = userId;
                    await _crud.UpdateAsync(emailSetting, ct);
                }
            }

            return MapToResponse(shop, request.BranchId ?? 0);
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error updating shop (UserId={UserId})", userId);
            return null;
        }
    }

    public async Task<ShopResponse?> UpdateBranch(int userId, UpdateBranchRequest request, string ip, string userAgent, CancellationToken ct)
    {
        _actionLog.Info("Updating branch (UserId={UserId}, BranchId={BranchId}, IP={IP})", userId, request.BranchId, ip);
        try
        {
            var shop = await _db.Shops
                .Include(s => s.ShopSettings)
                .Include(s => s.Status)
                .Include(s => s.Services)
                .Include(s => s.ShopBranches)
                    .ThenInclude(b => b.Address)
                        .ThenInclude(a => a.Subdistrict)
                            .ThenInclude(sd => sd.District)
                                .ThenInclude(d => d.Province)
                .FirstOrDefaultAsync(s => s.OwnerId == userId, ct);

            if (shop == null) return null;

            var branch = shop.ShopBranches.FirstOrDefault(b => b.Id == request.BranchId);
            if (branch == null) return null;

            bool branchUpdated = false;

            if (request.IsActive.HasValue)
            {
                branch.IsActive = request.IsActive.Value;
                branchUpdated = true;
            }

            if (!string.IsNullOrEmpty(request.BranchName))
            {
                branch.Name = request.BranchName;
                branchUpdated = true;
            }

            if (!string.IsNullOrEmpty(request.BranchPhone))
            {
                branch.Phone = request.BranchPhone;
                branchUpdated = true;
            }

            if (branchUpdated)
            {
                branch.UpdatedAt = DateTime.UtcNow;
                branch.UpdatedBy = userId;
                await _crud.UpdateAsync(branch, ct);
            }

            // Update Address if any address fields are provided
            if (branch.Address != null && (
                request.HouseNo != null || request.Street != null || request.SubdistrictId.HasValue || request.Zipcode != null))
            {
                if (request.HouseNo != null) branch.Address.HouseNo = request.HouseNo;
                if (request.Street != null) branch.Address.Street = request.Street;
                if (request.SubdistrictId.HasValue) branch.Address.SubdistrictId = request.SubdistrictId.Value;
                if (request.Zipcode != null) branch.Address.Zipcode = request.Zipcode;

                branch.Address.UpdatedAt = DateTime.UtcNow;
                branch.Address.UpdatedBy = userId;
                await _crud.UpdateAsync(branch.Address, ct);
            }

            return MapToResponse(shop, branch.Id);
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error updating branch (UserId={UserId})", userId);
            return null;
        }
    }

    public async Task<List<BusinessHourResponse>> GetBusinessHours(int branchId, CancellationToken ct)
    {
        var hours = await _db.ShopBusinessHours
            .Where(h => h.BranchId == branchId)
            .OrderBy(h => h.DayOfWeek)
            .ToListAsync(ct);
            
        return hours.Select(h => new BusinessHourResponse
        {
            DayOfWeek = h.DayOfWeek,
            IsOpen = h.IsActive,
            OpenTime = h.OpenTime.ToString("HH:mm"),
            CloseTime = h.CloseTime.ToString("HH:mm")
        }).ToList();
    }

    public async Task<List<BusinessHourResponse>> UpdateBusinessHours(int userId, UpdateBusinessHoursRequest request, string ip, string userAgent, CancellationToken ct)
    {
        var branch = await _db.ShopBranches
            .Include(b => b.Shop)
            .Include(b => b.ShopBusinessHours)
            .FirstOrDefaultAsync(b => b.Id == request.BranchId, ct);
            
        if (branch == null || branch.Shop.OwnerId != userId) return new List<BusinessHourResponse>();
        
        foreach (var h in request.Hours)
        {
            var existing = branch.ShopBusinessHours.FirstOrDefault(b => b.DayOfWeek == h.DayOfWeek);
            TimeOnly openTime = TimeOnly.TryParse(h.OpenTime, out var ot) ? ot : new TimeOnly(0, 0);
            TimeOnly closeTime = TimeOnly.TryParse(h.CloseTime, out var ctTime) ? ctTime : new TimeOnly(0, 0);
            
            if (existing != null)
            {
                existing.IsActive = h.IsOpen;
                existing.OpenTime = openTime;
                existing.CloseTime = closeTime;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = userId;
                await _crud.UpdateAsync(existing, ct);
            }
            else
            {
                var newHour = new ShopBusinessHour
                {
                    BranchId = request.BranchId,
                    DayOfWeek = h.DayOfWeek,
                    IsActive = h.IsOpen,
                    OpenTime = openTime,
                    CloseTime = closeTime,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };
                await _crud.InsertAsync(newHour, ct);
                branch.ShopBusinessHours.Add(newHour);
            }
        }
        
        return branch.ShopBusinessHours.OrderBy(h => h.DayOfWeek).Select(h => new BusinessHourResponse
        {
            DayOfWeek = h.DayOfWeek,
            IsOpen = h.IsActive,
            OpenTime = h.OpenTime.ToString("HH:mm"),
            CloseTime = h.CloseTime.ToString("HH:mm")
        }).ToList();
    }

    public async Task<List<HolidayResponse>> GetHolidays(int branchId, CancellationToken ct)
    {
        var holidays = await _db.ShopHolidays
            .Where(h => h.BranchId == branchId)
            .OrderBy(h => h.HolidayDate)
            .ToListAsync(ct);
            
        return holidays.Select(h => new HolidayResponse
        {
            Id = h.Id,
            Date = h.HolidayDate.ToString("yyyy-MM-dd"),
            Name = h.Reason
        }).ToList();
    }

    public async Task<HolidayResponse?> AddHoliday(int userId, AddHolidayRequest request, string ip, string userAgent, CancellationToken ct)
    {
        var branch = await _db.ShopBranches
            .Include(b => b.Shop)
            .FirstOrDefaultAsync(b => b.Id == request.BranchId, ct);
            
        if (branch == null || branch.Shop.OwnerId != userId) return null;
        
        DateOnly date = DateOnly.TryParse(request.Date, out var dt) ? dt : DateOnly.FromDateTime(DateTime.UtcNow);
        
        var holiday = new ShopHoliday
        {
            ShopId = branch.ShopId,
            BranchId = request.BranchId,
            HolidayDate = date,
            Reason = request.Name,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };
        
        await _crud.InsertAsync(holiday, ct);
        
        return new HolidayResponse
        {
            Id = holiday.Id,
            Date = holiday.HolidayDate.ToString("yyyy-MM-dd"),
            Name = holiday.Reason
        };
    }

    public async Task<bool> DeleteHoliday(int userId, int holidayId, string ip, string userAgent, CancellationToken ct)
    {
        var holiday = await _db.ShopHolidays
            .Include(h => h.Shop)
            .FirstOrDefaultAsync(h => h.Id == holidayId, ct);
            
        if (holiday == null || holiday.Shop.OwnerId != userId) return false;
        
        await _crud.DeleteAsync(holiday, ct);
        return true;
    }

    public async Task<QueueRulesResponse> GetQueueRules(int branchId, CancellationToken ct)
    {
        var settings = await _db.ShopSettings
            .AsNoTracking()
            .Where(s => s.BranchId == branchId && s.Key.StartsWith("queue."))
            .ToListAsync(ct);

        var rules = new QueueRulesResponse();

        foreach (var s in settings)
        {
            if (s.Key == "queue.slot_interval" && int.TryParse(s.Value, out int slot))
                rules.SlotInterval = slot;
            else if (s.Key == "queue.advance_booking_window" && int.TryParse(s.Value, out int adv))
                rules.AdvanceBookingWindow = adv;
            else if (s.Key == "queue.buffer_between_services" && int.TryParse(s.Value, out int buf))
                rules.BufferBetweenServices = buf;
        }

        return rules;
    }

    public async Task<QueueRulesResponse> UpdateQueueRules(int userId, UpdateQueueRulesRequest request, string ip, string userAgent, CancellationToken ct)
    {
        var branch = await _db.ShopBranches
            .Include(b => b.Shop)
            .FirstOrDefaultAsync(b => b.Id == request.BranchId, ct);

        if (branch == null || branch.Shop.OwnerId != userId)
            throw new Exception("Unauthorized to modify queue rules for this branch");

        var settings = await _db.ShopSettings
            .Where(s => s.BranchId == request.BranchId && s.Key.StartsWith("queue."))
            .ToListAsync(ct);

        var values = new Dictionary<string, string>
        {
            { "queue.slot_interval", request.SlotInterval.ToString() },
            { "queue.advance_booking_window", request.AdvanceBookingWindow.ToString() },
            { "queue.buffer_between_services", request.BufferBetweenServices.ToString() }
        };

        foreach (var kvp in values)
        {
            var setting = settings.FirstOrDefault(s => s.Key == kvp.Key);
            if (setting != null)
            {
                setting.Value = kvp.Value;
                setting.UpdatedAt = DateTime.UtcNow;
                setting.UpdatedBy = userId;
                _db.ShopSettings.Update(setting);
            }
            else
            {
                _db.ShopSettings.Add(new ShopSetting
                {
                    ShopId = branch.ShopId,
                    BranchId = request.BranchId,
                    Key = kvp.Key,
                    Value = kvp.Value,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                });
            }
        }

        await _db.SaveChangesAsync(ct);

        return new QueueRulesResponse
        {
            SlotInterval = request.SlotInterval,
            AdvanceBookingWindow = request.AdvanceBookingWindow,
            BufferBetweenServices = request.BufferBetweenServices
        };
    }

    // ================= Private Helper Methods =================

    private static ShopResponse MapToResponse(Shop shop, int branchId = 0) => new()
    {
        Id = shop.Id,
        Name = shop.Name ?? string.Empty,
        Type = shop.TypeId.ToString() ?? string.Empty,
        OwnerId = shop.OwnerId,
        Status = shop.StatusId,
        IsActive = shop.IsActive,
        Phone = shop.ShopBranches?.FirstOrDefault(b => branchId == 0 || b.Id == branchId)?.Phone ?? string.Empty,
        Address = shop.ShopBranches?.FirstOrDefault(b => branchId == 0 || b.Id == branchId)?.Address != null 
                    ? MapAddress(shop.ShopBranches.FirstOrDefault(b => branchId == 0 || b.Id == branchId)!.Address)!.FullAddress 
                    : string.Empty,
        Logo = shop.ShopSettings?.FirstOrDefault(s => s.Key == "Logo")?.Value,
        Description = shop.ShopSettings?.FirstOrDefault(s => s.Key == "Description")?.Value,
        Email = shop.ShopSettings?.FirstOrDefault(s => s.Key == "Email")?.Value,
        ShopBranches = shop.ShopBranches?.Where(b => branchId == 0 || b.Id == branchId).Select(b => new BranchDto
        {
            Id = b.Id,
            Name = b.Name ?? string.Empty,
            Phone = b.Phone ?? string.Empty,
            Address = MapAddress(b.Address),
            BusinessHours = b.ShopBusinessHours?.Select(h => new ShopBusinessHour
            {
                DayOfWeek = h.DayOfWeek,
                OpenTime = h.OpenTime,
                CloseTime = h.CloseTime
            }).ToList() ?? new()
        }).ToList() ?? new(),

        ShopHolidays = shop.ShopHolidays?.Select(h => new ShopHoliday
        {
            HolidayDate = h.HolidayDate,
            Reason = h.Reason ?? string.Empty
        }).OrderBy(h => h.HolidayDate).ToList() ?? new(),

        Services = shop.Services?.Select(s => new Domain.Entities.Service
        {
            Id = s.Id,
            Name = s.Name ?? string.Empty,
            Duration = s.Duration,
            Price = s.Price,
            IsActive = s.IsActive
        }).ToList() ?? new()
    };

    private static AddressDto? MapAddress(Address? address)
    {
        if (address == null) return null;
        return new AddressDto
        {
            HouseNo = address.HouseNo ?? string.Empty,
            Street = address.Street ?? string.Empty,
            Subdistrict = address.Subdistrict?.NameTh ?? string.Empty,
            District = address.Subdistrict?.District?.NameTh ?? string.Empty,
            Province = address.Subdistrict?.District?.Province?.NameTh ?? string.Empty,
            Zipcode = address.Zipcode ?? string.Empty
        };
    }
}