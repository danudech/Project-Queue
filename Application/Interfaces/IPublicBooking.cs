using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface IPublicBooking
{
    Task<PublicBookingPageResponse> GetPageAsync(
        string shopSlug,
        Guid branchPublicId,
        int? serviceId,
        DateTime? date,
        CancellationToken ct);

    Task<PublicBookingConfirmationResponse> CreateAsync(
        string shopSlug,
        Guid branchPublicId,
        CreatePublicBookingRequest request,
        CancellationToken ct);

    Task<PublicBookingManagementResponse> GetManagementAsync(
        Guid bookingGuid,
        string token,
        CancellationToken ct);

    Task<PublicBookingManagementResponse> CancelAsync(
        Guid bookingGuid,
        string token,
        CancellationToken ct);
}
