using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Booking
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int UserId { get; set; }

    public int BranchId { get; set; }

    public int QueueSlotId { get; set; }

    public int? AssignedStaffId { get; set; }

    public int? QueueCategoryId { get; set; }

    public int? QueueNumber { get; set; }

    public string? Remark { get; set; }

    public int StatusId { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ShopStaff? AssignedStaff { get; set; }

    public virtual ICollection<BookingService> BookingServices { get; set; } = new List<BookingService>();

    public virtual ShopBranch Branch { get; set; } = null!;

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual QueueCategory? QueueCategory { get; set; }

    public virtual QueueSlot QueueSlot { get; set; } = null!;

    public virtual MasterStatus Status { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
