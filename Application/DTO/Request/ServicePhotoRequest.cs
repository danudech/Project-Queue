using Microsoft.AspNetCore.Http;

namespace Queue.Application.DTO.Request;

public sealed class ServicePhotoRequest
{
    public IFormFile? Image { get; set; }
}
