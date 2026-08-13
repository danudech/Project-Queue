using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;

namespace Queue.Application.Interfaces;

public interface IChatService
{
    Task<List<ChatConversationResponse>> GetShopConversationsAsync(int userId, int branchId, CancellationToken ct);
    Task<List<ChatMessageResponse>> GetShopMessagesAsync(int userId, string conversationIdOrGuid, CancellationToken ct);
    Task<ChatMessageResponse> SendShopMessageAsync(int userId, string conversationIdOrGuid, SendChatMessageRequest request, CancellationToken ct);
    Task<ChatConversationResponse> StartPublicConversationAsync(CreatePublicChatRequest request, CancellationToken ct);
    Task<List<ChatMessageResponse>> GetPublicMessagesAsync(Guid conversationGuid, string? token, CancellationToken ct);
    Task<ChatMessageResponse> SendPublicMessageAsync(Guid conversationGuid, SendChatMessageRequest request, CancellationToken ct);
    Task ClosePublicConversationAsync(Guid conversationGuid, string? token, CancellationToken ct);
    Task<ChatConversationResponse> UpdatePublicProfileAsync(Guid conversationGuid, UpdatePublicChatProfileRequest request, CancellationToken ct);
    Task<ChatConversationResponse> GetPublicConversationAsync(Guid conversationGuid, string? token, CancellationToken ct);
    Task<ChatConversationResponse> AcceptConversationAsync(int userId, string conversationIdOrGuid, CancellationToken ct);
}
