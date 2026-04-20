using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopBranch
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int ShopId { get; set; }

    public string Name { get; set; } = null!;

    public int AddressId { get; set; }

    public string Phone { get; set; } = null!;

    public virtual Address Address { get; set; } = null!;

    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();

    public virtual ICollection<QueueSlot> QueueSlots { get; set; } = new List<QueueSlot>();

    public virtual ICollection<Queue> Queues { get; set; } = new List<Queue>();

    public virtual Shop Shop { get; set; } = null!;
}
