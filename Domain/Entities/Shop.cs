using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Shop
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public string Name { get; set; } = null!;

    public int OwnerId { get; set; }

    public int? TypeId { get; set; }

    public int StatusId { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual User Owner { get; set; } = null!;

    public virtual ICollection<QueueCategory> QueueCategories { get; set; } = new List<QueueCategory>();

    public virtual ICollection<QueueSlot> QueueSlots { get; set; } = new List<QueueSlot>();

    public virtual ICollection<ServiceCategory> ServiceCategories { get; set; } = new List<ServiceCategory>();

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();

    public virtual ICollection<ShopBranch> ShopBranches { get; set; } = new List<ShopBranch>();

    public virtual ICollection<ShopHoliday> ShopHolidays { get; set; } = new List<ShopHoliday>();

    public virtual ICollection<ShopRolePermission> ShopRolePermissions { get; set; } = new List<ShopRolePermission>();

    public virtual ICollection<ShopSetting> ShopSettings { get; set; } = new List<ShopSetting>();

    public virtual ICollection<ShopStaff> ShopStaffs { get; set; } = new List<ShopStaff>();

    public virtual ICollection<ShopUserRoleMap> ShopUserRoleMaps { get; set; } = new List<ShopUserRoleMap>();

    public virtual MasterStatus Status { get; set; } = null!;

    public virtual ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();

    public virtual MasterStatus? Type { get; set; }
}
