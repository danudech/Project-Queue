using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Queue.Api.Models.Response;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;

namespace Queue.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/chat")]
public sealed class ChatController : ControllerBase
{
    private readonly IChatService _chat;
    public ChatController(IChatService chat) => _chat = chat;
    private int UserId => int.TryParse(User.FindFirst("uid")?.Value, out int value) ? value : throw new UnauthorizedAccessException("User id claim is missing.");

    [HttpGet("conversations")]
    public Task<ActionResult<ApiResponse<List<ChatConversationResponse>>>> Conversations([FromQuery] int branchId = 0, CancellationToken ct = default) => Execute(() => _chat.GetShopConversationsAsync(UserId, branchId, ct));
    [HttpGet("conversations/{conversationId:int}/messages")]
    public Task<ActionResult<ApiResponse<List<ChatMessageResponse>>>> Messages(int conversationId, CancellationToken ct) => Execute(() => _chat.GetShopMessagesAsync(UserId, conversationId, ct));
    [HttpPost("conversations/{conversationId:int}/messages")]
    public Task<ActionResult<ApiResponse<ChatMessageResponse>>> Send(int conversationId, [FromBody] SendChatMessageRequest request, CancellationToken ct) => Execute(() => _chat.SendShopMessageAsync(UserId, conversationId, request, ct));
    [HttpPost("conversations/{conversationId:int}/accept")]
    public Task<ActionResult<ApiResponse<ChatConversationResponse>>> Accept(int conversationId, CancellationToken ct) => Execute(() => _chat.AcceptConversationAsync(UserId, conversationId, ct));
    private static async Task<ActionResult<ApiResponse<T>>> Execute<T>(Func<Task<T>> action) { try { return new OkObjectResult(ApiResponse<T>.Ok(await action())); } catch (UnauthorizedAccessException ex) { return new ObjectResult(ApiResponse<T>.Fail(ex.Message)) { StatusCode = 403 }; } catch (KeyNotFoundException ex) { return new NotFoundObjectResult(ApiResponse<T>.Fail(ex.Message)); } catch (InvalidOperationException ex) { return new BadRequestObjectResult(ApiResponse<T>.Fail(ex.Message)); } }
}

[ApiController]
[AllowAnonymous]
[Route("api/v1/public/chat")]
public sealed class PublicChatController : ControllerBase
{
    private readonly IChatService _chat;
    public PublicChatController(IChatService chat) => _chat = chat;
    [HttpPost("conversations")]
    public Task<ActionResult<ApiResponse<ChatConversationResponse>>> Start([FromBody] CreatePublicChatRequest request, CancellationToken ct) => Execute(() => _chat.StartPublicConversationAsync(request, ct));
    [HttpGet("conversations/{conversationGuid:guid}/messages")]
    public Task<ActionResult<ApiResponse<List<ChatMessageResponse>>>> Messages(Guid conversationGuid, [FromQuery] string? token, CancellationToken ct) => Execute(() => _chat.GetPublicMessagesAsync(conversationGuid, token, ct));
    [HttpGet("conversations/{conversationGuid:guid}")]
    public Task<ActionResult<ApiResponse<ChatConversationResponse>>> Conversation(Guid conversationGuid, [FromQuery] string? token, CancellationToken ct) => Execute(() => _chat.GetPublicConversationAsync(conversationGuid, token, ct));
    [HttpPost("conversations/{conversationGuid:guid}/messages")]
    public Task<ActionResult<ApiResponse<ChatMessageResponse>>> Send(Guid conversationGuid, [FromBody] SendChatMessageRequest request, CancellationToken ct) => Execute(() => _chat.SendPublicMessageAsync(conversationGuid, request, ct));
    [HttpPost("conversations/{conversationGuid:guid}/close")]
    public Task<ActionResult<ApiResponse<bool>>> Close(Guid conversationGuid, [FromBody] SendChatMessageRequest request, CancellationToken ct) => Execute(async () => { await _chat.ClosePublicConversationAsync(conversationGuid, request.Token, ct); return true; });
    [HttpPost("conversations/{conversationGuid:guid}/profile")]
    [Consumes("multipart/form-data")]
    public Task<ActionResult<ApiResponse<ChatConversationResponse>>> Profile(Guid conversationGuid, [FromForm] UpdatePublicChatProfileRequest request, CancellationToken ct) => Execute(() => _chat.UpdatePublicProfileAsync(conversationGuid, request, ct));
    private static async Task<ActionResult<ApiResponse<T>>> Execute<T>(Func<Task<T>> action) { try { return new OkObjectResult(ApiResponse<T>.Ok(await action())); } catch (UnauthorizedAccessException ex) { return new ObjectResult(ApiResponse<T>.Fail(ex.Message)) { StatusCode = 403 }; } catch (KeyNotFoundException ex) { return new NotFoundObjectResult(ApiResponse<T>.Fail(ex.Message)); } catch (InvalidOperationException ex) { return new BadRequestObjectResult(ApiResponse<T>.Fail(ex.Message)); } }
}
