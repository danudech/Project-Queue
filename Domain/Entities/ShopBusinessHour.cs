using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopBusinessHour
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public int DayOfWeek { get; set; }

    public TimeOnly OpenTime { get; set; }

    public TimeOnly CloseTime { get; set; }

    public virtual Shop Shop { get; set; } = null!;
}
