using Queue.Application.Interfaces;
using Queue.Application.DTO.Response;
using Queue.Infrastructure.Identity.Jwt;
using Queue.Infrastructure.Service;
using Queue.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class AddressRepository : IAddress
{
    private readonly IActionLog _actionLog;
    private readonly QueueDbContext _db;

    private readonly ICrudService _crud;

    public AddressRepository(IActionLog actionLog, QueueDbContext db, ICrudService crud)

    {
        _actionLog = actionLog;
        _db = db;
        _crud = crud;

    }

    public async Task<List<AddressResponse>?> GetAddressByZipcode(string zipcode, string ip, string userAgent, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(zipcode))
            return null;
        
         _actionLog.Info("Getting address by zipcode {Zipcode} (by={IP}, ua={UserAgent})", zipcode, ip, userAgent);
        List<AddressResponse>? _subdistrict = await _db.Subdistricts
                                            .AsNoTracking()
                                            .Include(s => s.District)
                                            .ThenInclude(d => d.Province)
                                            .Where(s => s.Zipcode == zipcode)
                                            .Select(s => new AddressResponse
                                            {
                                                SubdistrictId = s.Id,
                                                SubdistrictNameTh = s.NameTh,
                                                SubdistrictNameEn = s.NameEn,
                                                DistrictId = s.District.Id,
                                                DistrictNameTh = s.District.NameTh,
                                                DistrictNameEn = s.District.NameEn,
                                                ProvinceId = s.District.Province.Id,
                                                ProvinceNameTh = s.District.Province.NameTh,
                                                ProvinceNameEn = s.District.Province.NameEn,
                                                Zipcode = s.Zipcode
                                            })
                                            .ToListAsync(ct);
        if (_subdistrict == null || !_subdistrict.Any())
        {
            _actionLog.Info("No address found for zipcode {Zipcode} (by={IP}, ua={UserAgent})", zipcode, ip, userAgent);
            return null;
        }

        return _subdistrict;
    }
}