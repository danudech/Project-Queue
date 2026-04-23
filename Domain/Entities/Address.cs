using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Address
{
    public int Id { get; set; }

    public string HouseNo { get; set; } = null!;

    public string Street { get; set; } = null!;

    public int ProvinceId { get; set; }

    public int DistrictId { get; set; }

    public int SubdistrictId { get; set; }

    public string Zipcode { get; set; } = null!;

    public virtual District District { get; set; } = null!;

    public virtual Province Province { get; set; } = null!;

    public virtual ICollection<ShopBranch> ShopBranches { get; set; } = new List<ShopBranch>();

    public virtual Subdistrict Subdistrict { get; set; } = null!;
}
