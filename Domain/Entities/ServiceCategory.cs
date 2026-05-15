using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class ServiceCategory
{
    public int Id { get; set; }

    public int ShopId { get; set; }

    public int BranchId { get; set; }

    public string Name { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual ShopBranch Branch { get; set; } = null!;

    public virtual ICollection<ServiceCategoryMap> ServiceCategoryMaps { get; set; } = new List<ServiceCategoryMap>();

    public virtual Shop Shop { get; set; } = null!;
}
