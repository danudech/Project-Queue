using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Service
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int ShopId { get; set; }

    public int BranchId { get; set; }

    public string Name { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public int Duration { get; set; }

    public decimal Price { get; set; }

    public string StaffSelectionMode { get; set; } = null!;

    public bool IsActive { get; set; }

    public int? SlotInterval { get; set; }

    public int? AdvanceBookingWindow { get; set; }

    public int? BufferBetweenServices { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ICollection<BookingService> BookingServices { get; set; } = new List<BookingService>();

    public virtual ShopBranch Branch { get; set; } = null!;

    public virtual ICollection<Queue> Queues { get; set; } = new List<Queue>();

    public virtual ICollection<ServiceCategoryMap> ServiceCategoryMaps { get; set; } = new List<ServiceCategoryMap>();

    public virtual ICollection<ServiceStaffMap> ServiceStaffMaps { get; set; } = new List<ServiceStaffMap>();

    public virtual Shop Shop { get; set; } = null!;
}
