using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class CustomerNote
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string Note { get; set; } = null!;

    public virtual Customer Customer { get; set; } = null!;
}
