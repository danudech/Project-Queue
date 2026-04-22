using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class User
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public string? Name { get; set; }

    public string? Email { get; set; }

    public string? Phone { get; set; }

    public int StatusId { get; set; }

    public bool EmailConfirmed { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();

    public virtual ICollection<EmailConfirmation> EmailConfirmations { get; set; } = new List<EmailConfirmation>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<ShopStaff> ShopStaffs { get; set; } = new List<ShopStaff>();

    public virtual ICollection<Shop> Shops { get; set; } = new List<Shop>();

    public virtual MasterStatus Status { get; set; } = null!;

    public virtual ICollection<UserAuthentication> UserAuthentications { get; set; } = new List<UserAuthentication>();

    public virtual ICollection<UserImage> UserImages { get; set; } = new List<UserImage>();

    public virtual ICollection<UserRoleMap> UserRoleMaps { get; set; } = new List<UserRoleMap>();

    public virtual ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();
}
