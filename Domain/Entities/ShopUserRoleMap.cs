using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ShopUserRoleMap
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public int UserId { get; set; }

    public string RoleCode { get; set; } = null!;

    public bool IsActive { get; set; }

    public int? GrantedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual User? GrantedByNavigation { get; set; }

    public virtual Shop Shop { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
