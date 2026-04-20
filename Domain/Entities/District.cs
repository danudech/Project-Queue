using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class District
{
    public int Id { get; set; }

    public int ProvinceId { get; set; }

    public string NameTh { get; set; } = null!;

    public string NameEn { get; set; } = null!;

    public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();

    public virtual Province Province { get; set; } = null!;

    public virtual ICollection<Subdistrict> Subdistricts { get; set; } = new List<Subdistrict>();
}
