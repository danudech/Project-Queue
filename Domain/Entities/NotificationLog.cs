using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class NotificationLog
{
    public int Id { get; set; }

    public int NotificationId { get; set; }

    public int StatusId { get; set; }

    public DateTime SentAt { get; set; }

    public int? CreatedBy { get; set; }

    public virtual Notification Notification { get; set; } = null!;

    public virtual MasterStatus Status { get; set; } = null!;
}
