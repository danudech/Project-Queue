using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ServiceStaffMap
{
    public int ServiceId { get; set; }

    public int StaffId { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public virtual Service Service { get; set; } = null!;

    public virtual ShopStaff Staff { get; set; } = null!;
}
