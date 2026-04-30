using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class CustomerTag
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ICollection<CustomerTagMap> CustomerTagMaps { get; set; } = new List<CustomerTagMap>();
}
