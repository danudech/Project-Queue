using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class QueueSlot
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int ShopId { get; set; }

    public int BranchId { get; set; }

    public DateTime Date { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public int MaxQueue { get; set; }

    public int CurrentUsage { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ShopBranch Branch { get; set; } = null!;

    public virtual Shop Shop { get; set; } = null!;
}
