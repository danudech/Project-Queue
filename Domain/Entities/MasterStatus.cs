using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class MasterStatus
{
    public int Id { get; set; }

    public string Type { get; set; } = null!;

    public string Code { get; set; } = null!;

    public string NameTh { get; set; } = null!;

    public string NameEn { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();

    public virtual ICollection<NotificationLog> NotificationLogs { get; set; } = new List<NotificationLog>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<QueueLog> QueueLogs { get; set; } = new List<QueueLog>();

    public virtual ICollection<Queue> Queues { get; set; } = new List<Queue>();

    public virtual ICollection<Shop> ShopStatuses { get; set; } = new List<Shop>();

    public virtual ICollection<Shop> ShopTypes { get; set; } = new List<Shop>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
