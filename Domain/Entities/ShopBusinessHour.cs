using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopBusinessHour
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public int BranchId { get; set; }

    public int DayOfWeek { get; set; }

    public TimeOnly OpenTime { get; set; }

    public TimeOnly CloseTime { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ShopBranch Branch { get; set; } = null!;

    public virtual Shop Shop { get; set; } = null!;
}
