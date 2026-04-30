using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class CustomerNote
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string Note { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual Customer Customer { get; set; } = null!;
}
