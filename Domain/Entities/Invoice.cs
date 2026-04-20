using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Invoice
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int ShopId { get; set; }

    public decimal Amount { get; set; }

    public int StatusId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Shop Shop { get; set; } = null!;

    public virtual MasterStatus Status { get; set; } = null!;
}
