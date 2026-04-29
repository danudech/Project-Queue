using System.ComponentModel.DataAnnotations;

namespace Queue.Application.DTO.Request;

public sealed class CreateShopRequest
{
    [Required(ErrorMessage = "ShopName is required")]
    [MaxLength(100, ErrorMessage = "ShopName must not exceed 100 characters")]
    public string ShopName { get; set; } = string.Empty;

    [Required(ErrorMessage = "ShopType is required")]
    public string ShopType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Branch is required")]
    public BranchRequest? Branch { get; set; }

    [Required(ErrorMessage = "BusinessHours is required")]
    [MinLength(1, ErrorMessage = "BusinessHours must have at least 1 item")]
    public List<BusinessHourRequest> BusinessHours { get; set; } = new List<BusinessHourRequest>();
}

public sealed class BranchRequest
{
    [Required(ErrorMessage = "BranchName is required")]
    [MaxLength(100, ErrorMessage = "BranchName must not exceed 100 characters")]
    public string BranchName { get; set; } = string.Empty;

    [Required(ErrorMessage = "BranchPhone is required")]
    [Phone(ErrorMessage = "BranchPhone is not a valid phone number")]
    [MaxLength(20, ErrorMessage = "BranchPhone must not exceed 20 characters")]
    public string BranchPhone { get; set; } = string.Empty;

    [Required(ErrorMessage = "BranchAddress is required")]
    public BranchAddressRequest? BranchAddress { get; set; }
}

public sealed class BranchAddressRequest
{
    public string? HouseNo { get; set; }
    public string? Street { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "SubdistrictId must be greater than 0")]
    public int SubdistrictId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "DistrictId must be greater than 0")]
    public int DistrictId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ProvinceId must be greater than 0")]
    public int ProvinceId { get; set; }

    [Required(ErrorMessage = "Zipcode is required")]
    [RegularExpression(@"^\d{5}$", ErrorMessage = "Zipcode must be 5 digits")]
    public string Zipcode { get; set; } = string.Empty;
}

public sealed class BusinessHourRequest
{
    [Range(0, 6, ErrorMessage = "DayOfWeek must be between 0 (Sunday) and 6 (Saturday)")]
    public int DayOfWeek { get; set; }

    public bool IsOpen { get; set; }

    [Required(ErrorMessage = "OpenTime is required")]
    [RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$", ErrorMessage = "OpenTime must be in HH:mm format")]
    public string OpenTime { get; set; } = string.Empty;

    [Required(ErrorMessage = "CloseTime is required")]
    [RegularExpression(@"^([01]\d|2[0-3]):[0-5]\d$", ErrorMessage = "CloseTime must be in HH:mm format")]
    public string CloseTime { get; set; } = string.Empty;
}