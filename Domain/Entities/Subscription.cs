using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Subscription
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int ShopId { get; set; }

    public string PlanName { get; set; } = null!;

    public decimal Price { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public virtual Shop Shop { get; set; } = null!;
}
