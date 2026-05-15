using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Queue
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int BranchId { get; set; }

    public int QueueNumber { get; set; }

    public int StatusId { get; set; }

    public string Type { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ShopBranch Branch { get; set; } = null!;

    public virtual ICollection<QueueLog> QueueLogs { get; set; } = new List<QueueLog>();

    public virtual MasterStatus Status { get; set; } = null!;
}
