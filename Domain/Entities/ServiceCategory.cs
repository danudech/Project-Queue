using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ServiceCategory
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public string Name { get; set; } = null!;

    public virtual Shop Shop { get; set; } = null!;

    public virtual ICollection<Service> Services { get; set; } = new List<Service>();
}
