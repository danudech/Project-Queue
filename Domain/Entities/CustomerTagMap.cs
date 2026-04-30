using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class CustomerTagMap
{
    public int CustomerId { get; set; }

    public int TagId { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual CustomerTag Tag { get; set; } = null!;
}
