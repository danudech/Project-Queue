using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class CustomerTag
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<CustomerTagMap> CustomerTagMaps { get; set; } = new List<CustomerTagMap>();
}
