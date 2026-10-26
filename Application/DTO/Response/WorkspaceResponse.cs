namespace Queue.Application.DTO.Response;

public sealed record WorkspaceMetric(string Name, decimal Value);
public sealed record WorkspaceRow(int Id, string Name, string? Description, bool IsActive, int? BranchId = null, string? Prefix = null, int Count = 0, List<int>? RelatedIds = null);
public sealed record WorkspaceActivity(int Id, string TableName, string RecordId, string Action, DateTime CreatedAt, int? CreatedBy, string? Fields);
public sealed class WorkspaceResponse
{
    public List<WorkspaceMetric> Metrics { get; set; } = [];
    public List<WorkspaceRow> Rows { get; set; } = [];
    public List<WorkspaceActivity> Activities { get; set; } = [];
    public List<WorkspaceRow> Customers { get; set; } = [];
    public List<int> AssignedIds { get; set; } = [];
    public bool CanEdit { get; set; }
    public int Total { get; set; }
}
