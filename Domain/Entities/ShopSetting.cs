using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopSetting
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public string Key { get; set; } = null!;

    public string Value { get; set; } = null!;

    public virtual Shop Shop { get; set; } = null!;
}
