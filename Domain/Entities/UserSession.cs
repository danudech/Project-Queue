using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class UserSession
{
    public int Id { get; set; }

    public Guid Guid { get; set; }

    public int UserId { get; set; }

    public string? Session { get; set; }

    public string Token { get; set; } = null!;

    public string? RefreshToken { get; set; }

    public string? RefreshSalt { get; set; }

    public DateTime? RefreshTokenExpiredAt { get; set; }

    public DateTime ExpiredAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public virtual User User { get; set; } = null!;
}
