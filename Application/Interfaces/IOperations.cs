using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface IOperations
{
    Task<List<StaffResponse>> GetStaffAsync(int userId, int branchId, int? serviceId, CancellationToken ct);
    Task<List<StaffResponse>> GetEligibleStaffAsync(int branchId, int serviceId, CancellationToken ct);
    Task<List<ShopServiceResponse>> GetCatalogAsync(int branchId, CancellationToken ct);
    Task<StaffResponse> SaveStaffAsync(int userId, StaffUpsertRequest request, CancellationToken ct);
    Task<string> SendStaffInviteAsync(int userId, StaffInviteRequest request, string appUrl, CancellationToken ct);
    Task<bool> DeleteStaffAsync(int userId, int staffId, CancellationToken ct);
    Task<List<AvailableSlotResponse>> GetSlotsAsync(int branchId, DateTime? date, CancellationToken ct);
    Task<BookingResponse> CreateBookingAsync(int userId, CreateBookingRequest request, CancellationToken ct);
    Task<List<BookingResponse>> GetBookingsAsync(int userId, int branchId, CancellationToken ct);
    Task<BookingResponse> UpdateBookingAsync(int userId, int bookingId, UpdateOperationStatusRequest request, CancellationToken ct);
    Task<QueueResponse> CreateQueueAsync(int userId, CreateQueueRequest request, CancellationToken ct);
    Task<List<QueueResponse>> GetQueuesAsync(int userId, int branchId, CancellationToken ct);
    Task<QueueResponse> UpdateQueueAsync(int userId, int queueId, UpdateOperationStatusRequest request, CancellationToken ct);
}
