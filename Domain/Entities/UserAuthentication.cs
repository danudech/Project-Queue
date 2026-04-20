using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class UserAuthentication
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Provider { get; set; } = null!;

    public string ProviderId { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateTime? LastLoginAt { get; set; }

    public virtual User User { get; set; } = null!;
}
