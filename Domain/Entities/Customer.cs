using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Customer
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int ShopId { get; set; }

    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public virtual ICollection<CustomerNote> CustomerNotes { get; set; } = new List<CustomerNote>();

    public virtual Shop Shop { get; set; } = null!;

    public virtual User User { get; set; } = null!;

    public virtual ICollection<CustomerTag> Tags { get; set; } = new List<CustomerTag>();
}
