using System;
using Queue.Domain.Entities;

namespace Queue.Application.DTO.Response;

public class AddressResponse
{
    public int SubdistrictId { get; set; }
    public string SubdistrictNameTh { get; set; } = string.Empty;
    public string SubdistrictNameEn { get; set; } = string.Empty;

    public int DistrictId { get; set; }
    public string DistrictNameTh { get; set; } = string.Empty;
    public string DistrictNameEn { get; set; } = string.Empty;

    public int ProvinceId { get; set; }
    public string ProvinceNameTh { get; set; } = string.Empty;
    public string ProvinceNameEn { get; set; } = string.Empty;

    public string Zipcode { get; set; } = string.Empty;
}