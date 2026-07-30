using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Customer
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int ShopId { get; set; }

    public int? UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string? Email { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ICollection<CustomerNote> CustomerNotes { get; set; } = new List<CustomerNote>();

    public virtual ICollection<CustomerTagMap> CustomerTagMaps { get; set; } = new List<CustomerTagMap>();

    public virtual Shop Shop { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
