using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ServiceCategoryMap
{
    public int ServiceId { get; set; }

    public int CategoryId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ServiceCategory Category { get; set; } = null!;

    public virtual Service Service { get; set; } = null!;
}
