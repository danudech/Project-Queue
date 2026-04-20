using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Notification
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int UserId { get; set; }

    public string Type { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public int StatusId { get; set; }

    public virtual ICollection<NotificationLog> NotificationLogs { get; set; } = new List<NotificationLog>();

    public virtual MasterStatus Status { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
