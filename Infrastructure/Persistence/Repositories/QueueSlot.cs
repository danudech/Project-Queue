

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Identity.Security;
using Queue.Infrastructure.Service;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class QueueSlot : IQueueSlot
{
    private readonly IActionLog _actionLog;
    private readonly QueueDbContext _db;
    private readonly IEmailService _emailService;
    private readonly ICrudService _crud;
    private readonly IConfiguration _config;


    public QueueSlot(IActionLog actionLog, QueueDbContext db, IEmailService emailService, ICrudService crud, IConfiguration config)

    {
        _actionLog = actionLog;
        _db = db;
        _emailService = emailService;
        _config = config;
        _crud = crud;

    }

    public async Task<List<QueueSlotResponse>> GetQueueSlots(int serviceId, DateTime slotDate, CancellationToken ct)
    {
        Domain.Entities.Service? _service = await _db.Services.FirstOrDefaultAsync(s => s.Id == serviceId, ct);
        if (_service == null)
        {
            _actionLog.Warning("Service not found (ServiceId={ServiceId})", serviceId);
            return new List<QueueSlotResponse>();
        }
        if (!_service.IsActive)
        {
            _actionLog.Warning("Service is not active (ServiceId={ServiceId})", serviceId);
            return new List<QueueSlotResponse>();
        }

        List<QueueSlotResponse> resp = await _db.QueueSlots.Where(qs => qs.ShopId == _service.ShopId && qs.Date.Date == slotDate.Date)
            .Select(qs => new QueueSlotResponse
            {
                Id = qs.Id,
                ServiceId = _service.Id,
                SlotDate = qs.Date,
                IsAvailable = qs.IsActive
            }).ToListAsync(ct);

        return resp;
    }
}