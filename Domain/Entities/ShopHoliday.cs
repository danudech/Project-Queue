using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopHoliday
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public DateOnly HolidayDate { get; set; }

    public string Reason { get; set; } = null!;

    public virtual Shop Shop { get; set; } = null!;
}
