using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Booking
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int UserId { get; set; }

    public int ShopId { get; set; }

    public int BranchId { get; set; }

    public int QueueSlotId { get; set; }

    public int? QueueCategoryId { get; set; }

    public string? QueueNumber { get; set; }

    public string? Remark { get; set; }

    public int StatusId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ShopBranch Branch { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual QueueCategory? QueueCategory { get; set; }

    public virtual QueueSlot QueueSlot { get; set; } = null!;

    public virtual Shop Shop { get; set; } = null!;

    public virtual MasterStatus Status { get; set; } = null!;

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();
}
