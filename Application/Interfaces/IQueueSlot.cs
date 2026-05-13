
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface IQueueSlot
{
    Task<List<QueueSlotResponse>> GetQueueSlots(int serviceId, DateTime slotDate, CancellationToken ct);
}
