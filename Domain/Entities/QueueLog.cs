using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class QueueLog
{
    public int Id { get; set; }

    public int QueueId { get; set; }

    public int StatusId { get; set; }

    public DateTime Timestamp { get; set; }

    public virtual Queue Queue { get; set; } = null!;

    public virtual MasterStatus Status { get; set; } = null!;
}
