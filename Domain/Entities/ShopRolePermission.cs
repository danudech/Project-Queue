using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopRolePermission
{
    public int Id { get; set; }

    public int? ShopId { get; set; }

    public string RoleCode { get; set; } = null!;

    public string PermissionCode { get; set; } = null!;

    public bool IsGranted { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual Shop? Shop { get; set; }
}
