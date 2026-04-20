using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class SystemConfig
{
    public string Key { get; set; } = null!;

    public string Value { get; set; } = null!;
}
