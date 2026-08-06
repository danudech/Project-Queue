namespace Queue.Application.DTO.Response;

public sealed class PublicBookingPageResponse
{
    public string ShopSlug { get; set; } = string.Empty;
    public string ShopName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string LogoPosition { get; set; } = "50% 50%";
    public string? CoverUrl { get; set; }
    public string CoverPosition { get; set; } = "50% 50%";
    public string? ShopDescription { get; set; }
    public string? ShopEmail { get; set; }
    public string? ShopTypeNameTh { get; set; }
    public string? ShopTypeNameEn { get; set; }
    public Guid BranchPublicId { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchPhone { get; set; } = string.Empty;
    public string BranchAddress { get; set; } = string.Empty;
    public bool IsOnlineBookingEnabled { get; set; }
    public List<PublicBookingServiceResponse> Services { get; set; } = new();
    public List<PublicBookingStaffResponse> Staff { get; set; } = new();
    public List<AvailableSlotResponse> Slots { get; set; } = new();
    public List<PublicBusinessHourResponse> BusinessHours { get; set; } = new();
}

public sealed class PublicBusinessHourResponse
{
    public int DayOfWeek { get; set; }
    public string OpenTime { get; set; } = string.Empty;
    public string CloseTime { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public sealed class PublicBookingServiceResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Duration { get; set; }
    public decimal Price { get; set; }
    public string StaffSelectionMode { get; set; } = "OPTIONAL";
}

public sealed class PublicBookingStaffResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
}

public class PublicBookingManagementResponse
{
    public Guid Guid { get; set; }
    public string ShopSlug { get; set; } = string.Empty;
    public Guid BranchPublicId { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? ShopTypeNameTh { get; set; }
    public string? ShopTypeNameEn { get; set; }
    public string? ShopEmail { get; set; }
    public string BranchName { get; set; } = string.Empty;
    public string BranchPhone { get; set; } = string.Empty;
    public string BranchAddress { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string StartTime { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? StaffName { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool CanCancel { get; set; }
}

public sealed class PublicBookingConfirmationResponse : PublicBookingManagementResponse
{
    public string ManagementToken { get; set; } = string.Empty;
}
