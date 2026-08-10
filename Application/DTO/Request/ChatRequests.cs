namespace Queue.Application.DTO.Request;

using Microsoft.AspNetCore.Http;

public sealed class CreatePublicChatRequest
{
    public string ShopSlug { get; set; } = string.Empty;
    public Guid BranchPublicId { get; set; }
    public Guid? BookingGuid { get; set; }
    public string? Token { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
}

public sealed class SendChatMessageRequest
{
    public string Body { get; set; } = string.Empty;
    public string? Token { get; set; }
}

public sealed class UpdatePublicChatProfileRequest
{
    public string? Token { get; set; }
    public IFormFile? ProfilePicture { get; set; }
}
