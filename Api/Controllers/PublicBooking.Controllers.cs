using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Queue.Api.Models.Response;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;

namespace Queue.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v1/public/booking/{shopSlug}/{branchPublicId:guid}")]
public sealed class PublicBookingController : ControllerBase
{
    private readonly IPublicBooking _publicBooking;

    public PublicBookingController(IPublicBooking publicBooking) =>
        _publicBooking = publicBooking;

    [HttpGet]
    [EnableRateLimiting("public-booking-read")]
    public Task<ActionResult<ApiResponse<PublicBookingPageResponse>>> Get(
        string shopSlug,
        Guid branchPublicId,
        [FromQuery] int? serviceId,
        [FromQuery] DateTime? date,
        CancellationToken ct) =>
        Execute(() => _publicBooking.GetPageAsync(shopSlug, branchPublicId, serviceId, date, ct));

    [HttpPost]
    [EnableRateLimiting("public-booking-write")]
    public Task<ActionResult<ApiResponse<PublicBookingConfirmationResponse>>> Create(
        string shopSlug,
        Guid branchPublicId,
        [FromBody] CreatePublicBookingRequest request,
        CancellationToken ct) =>
        Execute(() => _publicBooking.CreateAsync(shopSlug, branchPublicId, request, ct));

    [HttpGet("~/api/v1/public/booking/manage/{bookingGuid:guid}")]
    [EnableRateLimiting("public-booking-read")]
    public Task<ActionResult<ApiResponse<PublicBookingManagementResponse>>> GetManagement(
        Guid bookingGuid,
        [FromQuery] string token,
        CancellationToken ct) =>
        Execute(() => _publicBooking.GetManagementAsync(bookingGuid, token, ct));

    [HttpPost("~/api/v1/public/booking/manage/{bookingGuid:guid}/cancel")]
    [EnableRateLimiting("public-booking-write")]
    public Task<ActionResult<ApiResponse<PublicBookingManagementResponse>>> Cancel(
        Guid bookingGuid,
        [FromQuery] string token,
        CancellationToken ct) =>
        Execute(() => _publicBooking.CancelAsync(bookingGuid, token, ct));

    private async Task<ActionResult<ApiResponse<T>>> Execute<T>(Func<Task<T>> action)
    {
        try { return Ok(ApiResponse<T>.Ok(await action())); }
        catch (KeyNotFoundException ex) { return NotFound(ApiResponse<T>.Fail(ex.Message)); }
        catch (InvalidOperationException ex) { return BadRequest(ApiResponse<T>.Fail(ex.Message)); }
        catch (Exception) { return StatusCode(500, ApiResponse<T>.Fail("An unexpected error occurred.")); }
    }
}
