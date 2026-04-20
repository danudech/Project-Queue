using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class Subdistrict
{
    public int Id { get; set; }

    public int DistrictId { get; set; }

    public string NameTh { get; set; } = null!;

    public string NameEn { get; set; } = null!;

    public string Zipcode { get; set; } = null!;

    public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();

    public virtual District District { get; set; } = null!;
}
