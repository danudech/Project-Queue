using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class QueueCategory
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public string Prefix { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual Shop Shop { get; set; } = null!;
}
