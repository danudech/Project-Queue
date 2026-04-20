using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Service
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int ShopId { get; set; }

    public string Name { get; set; } = null!;

    public int Duration { get; set; }

    public decimal Price { get; set; }

    public bool IsActive { get; set; }

    public virtual Shop Shop { get; set; } = null!;

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<ServiceCategory> Categories { get; set; } = new List<ServiceCategory>();

    public virtual ICollection<ShopStaff> Staff { get; set; } = new List<ShopStaff>();
}
