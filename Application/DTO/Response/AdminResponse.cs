using System;
using System.Collections.Generic;

namespace Queue.Application.DTO.Response;

public sealed class AdminOverviewResponse
{
    public int ActiveShops { get; set; }
    public int PlatformUsers { get; set; }
    public int QueuesToday { get; set; }
    public int BookingsToday { get; set; }
    public string HealthyServices { get; set; } = "99.98%";
    public List<AdminShopDto> RecentShops { get; set; } = [];
    public List<AdminActivityDto> RecentActivity { get; set; } = [];
    public List<AdminServiceHealthDto> ServiceHealth { get; set; } = [];
}

public sealed class AdminShopDto
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public string Name { get; set; } = null!;
    public string Owner { get; set; } = null!;
    public int Branches { get; set; }
    public int Queues { get; set; }
    public string Plan { get; set; } = "Standard";
    public string Status { get; set; } = "Active";
    public string Joined { get; set; } = "Recent";
    public bool IsActive { get; set; }
}

public sealed class AdminUserDto
{
    public int Id { get; set; }
    public Guid Guid { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string Role { get; set; } = "Customer";
    public string Shop { get; set; } = "—";
    public string LastActive { get; set; } = "Recent";
    public string Status { get; set; } = "Active";
    public bool IsActive { get; set; }
}

public sealed class AdminOperationDto
{
    public string Service { get; set; } = null!;
    public string Region { get; set; } = null!;
    public string Throughput { get; set; } = null!;
    public string Latency { get; set; } = null!;
    public string Status { get; set; } = "Healthy";
}

public sealed class AdminAuditDto
{
    public int Id { get; set; }
    public string Timestamp { get; set; } = null!;
    public string Actor { get; set; } = null!;
    public string Action { get; set; } = null!;
    public string Target { get; set; } = null!;
    public string Result { get; set; } = "Success";
}

public sealed class AdminSettingDto
{
    public string Key { get; set; } = null!;
    public string Scope { get; set; } = "Global";
    public string Value { get; set; } = null!;
    public string UpdatedBy { get; set; } = "System";
    public string State { get; set; } = "Active";
}

public sealed class AdminActivityDto
{
    public string Title { get; set; } = null!;
    public string Actor { get; set; } = null!;
    public string Detail { get; set; } = null!;
    public string Timestamp { get; set; } = null!;
    public string Tone { get; set; } = "info";
}

public sealed class AdminServiceHealthDto
{
    public string Name { get; set; } = null!;
    public string Status { get; set; } = "Healthy";
    public string Latency { get; set; } = null!;
    public string Throughput { get; set; } = null!;
    public string Region { get; set; } = null!;
}
