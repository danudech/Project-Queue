using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class UserImage
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string FileUrl { get; set; } = null!;

    public string FileName { get; set; } = null!;

    public string ContentType { get; set; } = null!;

    public long FileSize { get; set; }

    public bool IsPrimary { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    public virtual User User { get; set; } = null!;
}
