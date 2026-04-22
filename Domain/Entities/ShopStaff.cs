using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopStaff
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public int UserId { get; set; }

    public string Role { get; set; } = null!;

    public virtual ICollection<ServiceStaffMap> ServiceStaffMaps { get; set; } = new List<ServiceStaffMap>();

    public virtual Shop Shop { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
