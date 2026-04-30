using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class PaymentTransaction
{
    public int Id { get; set; }

    public int PaymentId { get; set; }

    public string Provider { get; set; } = null!;

    public string TransactionRef { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public virtual Payment Payment { get; set; } = null!;
}
