using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopBranch
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public Guid PublicBookingId { get; set; } = Guid.NewGuid();

    public bool IsOnlineBookingEnabled { get; set; } = true;

    public int ShopId { get; set; }

    public string Name { get; set; } = null!;

    public int AddressId { get; set; }

    public string Phone { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual Address Address { get; set; } = null!;

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<BranchUserRoleMap> BranchUserRoleMaps { get; set; } = new List<BranchUserRoleMap>();

    public virtual ICollection<QueueCategory> QueueCategories { get; set; } = new List<QueueCategory>();

    public virtual ICollection<QueueSlot> QueueSlots { get; set; } = new List<QueueSlot>();

    public virtual ICollection<Queue> Queues { get; set; } = new List<Queue>();

    public virtual ICollection<ServiceCategory> ServiceCategories { get; set; } = new List<ServiceCategory>();

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();

    public virtual Shop Shop { get; set; } = null!;

    public virtual ICollection<ShopBusinessHour> ShopBusinessHours { get; set; } = new List<ShopBusinessHour>();

    public virtual ICollection<ShopHoliday> ShopHolidays { get; set; } = new List<ShopHoliday>();

    public virtual ICollection<ShopSetting> ShopSettings { get; set; } = new List<ShopSetting>();

    public virtual ICollection<ShopStaff> ShopStaffs { get; set; } = new List<ShopStaff>();
}
