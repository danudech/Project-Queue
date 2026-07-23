using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Queue.Api.Models.Response;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;

namespace Queue.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/operations")]
public sealed class OperationsController : ControllerBase
{
    private readonly IOperations _operations;

    public OperationsController(IOperations operations) => _operations = operations;

    [HttpGet("staff")]
    public Task<ActionResult<ApiResponse<List<StaffResponse>>>> GetStaff([FromQuery] int branchId, [FromQuery] int? serviceId, CancellationToken ct) =>
        Execute(() => _operations.GetStaffAsync(UserId, branchId, serviceId, ct));

    [HttpGet("staff/eligible")]
    public Task<ActionResult<ApiResponse<List<StaffResponse>>>> GetEligibleStaff([FromQuery] int branchId, [FromQuery] int serviceId, CancellationToken ct) =>
        Execute(() => _operations.GetEligibleStaffAsync(branchId, serviceId, ct));

    [HttpGet("catalog")]
    public Task<ActionResult<ApiResponse<List<ShopServiceResponse>>>> GetCatalog([FromQuery] int branchId, CancellationToken ct) =>
        Execute(() => _operations.GetCatalogAsync(branchId, ct));

    [HttpPost("staff")]
    public Task<ActionResult<ApiResponse<StaffResponse>>> AddStaff([FromBody] StaffUpsertRequest request, CancellationToken ct) =>
        Execute(() => _operations.SaveStaffAsync(UserId, request, ct));

    [HttpPut("staff")]
    public Task<ActionResult<ApiResponse<StaffResponse>>> UpdateStaff([FromBody] StaffUpsertRequest request, CancellationToken ct) =>
        Execute(() => _operations.SaveStaffAsync(UserId, request, ct));

    [HttpPost("staff/invite")]
    public Task<ActionResult<ApiResponse<string>>> InviteStaff([FromBody] StaffInviteRequest request, CancellationToken ct)
    {
        string appUrl = Request.Headers.Origin.FirstOrDefault()
            ?? $"{Request.Scheme}://{Request.Host}";
        return Execute(() => _operations.SendStaffInviteAsync(UserId, request, appUrl, ct));
    }

    [HttpDelete("staff/{staffId:int}")]
    public Task<ActionResult<ApiResponse<bool>>> DeleteStaff(int staffId, CancellationToken ct) =>
        Execute(() => _operations.DeleteStaffAsync(UserId, staffId, ct));

    [HttpGet("slots")]
    public Task<ActionResult<ApiResponse<List<AvailableSlotResponse>>>> GetSlots([FromQuery] int branchId, [FromQuery] DateTime? date, CancellationToken ct) =>
        Execute(() => _operations.GetSlotsAsync(branchId, date, ct));

    [HttpGet("bookings")]
    public Task<ActionResult<ApiResponse<List<BookingResponse>>>> GetBookings([FromQuery] int branchId = 0, CancellationToken ct = default) =>
        Execute(() => _operations.GetBookingsAsync(UserId, branchId, ct));

    [HttpPost("bookings")]
    public Task<ActionResult<ApiResponse<BookingResponse>>> CreateBooking([FromBody] CreateBookingRequest request, CancellationToken ct) =>
        Execute(() => _operations.CreateBookingAsync(UserId, request, ct));

    [HttpPatch("bookings/{bookingId:int}")]
    public Task<ActionResult<ApiResponse<BookingResponse>>> UpdateBooking(int bookingId, [FromBody] UpdateOperationStatusRequest request, CancellationToken ct) =>
        Execute(() => _operations.UpdateBookingAsync(UserId, bookingId, request, ct));

    [HttpPatch("bookings")]
    public Task<ActionResult<ApiResponse<BookingResponse>>> UpdateBookingQuery([FromQuery] int bookingId, [FromBody] UpdateOperationStatusRequest request, CancellationToken ct) =>
        Execute(() => _operations.UpdateBookingAsync(UserId, bookingId, request, ct));

    [HttpGet("queues")]
    public Task<ActionResult<ApiResponse<List<QueueResponse>>>> GetQueues([FromQuery] int branchId, CancellationToken ct) =>
        Execute(() => _operations.GetQueuesAsync(UserId, branchId, ct));

    [HttpPost("queues")]
    public Task<ActionResult<ApiResponse<QueueResponse>>> CreateQueue([FromBody] CreateQueueRequest request, CancellationToken ct) =>
        Execute(() => _operations.CreateQueueAsync(UserId, request, ct));

    [HttpPatch("queues/{queueId:int}")]
    public Task<ActionResult<ApiResponse<QueueResponse>>> UpdateQueue(int queueId, [FromBody] UpdateOperationStatusRequest request, CancellationToken ct) =>
        Execute(() => _operations.UpdateQueueAsync(UserId, queueId, request, ct));

    [HttpPatch("queues")]
    public Task<ActionResult<ApiResponse<QueueResponse>>> UpdateQueueQuery([FromQuery] int queueId, [FromBody] UpdateOperationStatusRequest request, CancellationToken ct) =>
        Execute(() => _operations.UpdateQueueAsync(UserId, queueId, request, ct));

    private int UserId => int.TryParse(User.FindFirst("uid")?.Value, out int id) ? id : 0;

    private async Task<ActionResult<ApiResponse<T>>> Execute<T>(Func<Task<T>> action)
    {
        try { return Ok(ApiResponse<T>.Ok(await action())); }
        catch (UnauthorizedAccessException ex) { return StatusCode(403, ApiResponse<T>.Fail(ex.Message)); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<T>.Fail(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<T>.Fail(ex.Message)); }
        catch (Exception) { return StatusCode(500, ApiResponse<T>.Fail("An unexpected error occurred.")); }
    }
}
