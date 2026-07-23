using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopStaff
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public int BranchId { get; set; }

    public int? UserId { get; set; }

    public string Name { get; set; } = null!;

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public string Role { get; set; } = null!;

    public bool CanServeQueues { get; set; }

    public bool CanLogin { get; set; }

    public bool IsAvailable { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ICollection<Booking> AssignedBookings { get; set; } = new List<Booking>();

    public virtual ShopBranch Branch { get; set; } = null!;

    public virtual ICollection<Queue> AssignedQueues { get; set; } = new List<Queue>();

    public virtual ICollection<ServiceStaffMap> ServiceStaffMaps { get; set; } = new List<ServiceStaffMap>();

    public virtual Shop Shop { get; set; } = null!;

    public virtual User? User { get; set; }
}
