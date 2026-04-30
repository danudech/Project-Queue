using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class UserRoleMap
{
    public int UserId { get; set; }

    public int RoleId { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
