using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopSetting
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public string Key { get; set; } = null!;

    public string Value { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual Shop Shop { get; set; } = null!;
}
