using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Service;
using Queue.Infrastructure.Services;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class ChatService : IChatService
{
    private static readonly TimeSpan CustomerReplyTimeout = TimeSpan.FromMinutes(30);
    private readonly QueueDbContext _db;
    private readonly PermissionScopeService _permissions;
    private readonly byte[] _managementKey;
    private readonly IWebHostEnvironment _environment;

    public ChatService(QueueDbContext db, PermissionScopeService permissions, IConfiguration configuration, IWebHostEnvironment environment)
    {
        _db = db;
        _permissions = permissions;
        string key = configuration["PublicBooking:ManagementKey"] ?? configuration["Jwt:SignKey"] ?? throw new InvalidOperationException("A chat management key is required.");
        _managementKey = Encoding.UTF8.GetBytes(key);
        _environment = environment;
    }

    public async Task<List<ChatConversationResponse>> GetShopConversationsAsync(int userId, int branchId, CancellationToken ct)
    {
        IQueryable<int> branchIds;
        if (branchId > 0)
        {
            await _permissions.EnsureBranchAsync(userId, branchId, "branch.view", ct);
            branchIds = _db.ShopBranches.Where(item => item.Id == branchId).Select(item => item.Id);
        }
        else
        {
            var homeShopId = await _db.Users.AsNoTracking()
                .Where(item => item.Id == userId)
                .Select(item => item.HomeShopId)
                .SingleOrDefaultAsync(ct);
            if (!homeShopId.HasValue)
                return [];
            await _permissions.EnsureShopAsync(userId, homeShopId.Value, "branch.view", ct);
            branchIds = _db.ShopBranches
                .Where(item => item.ShopId == homeShopId.Value && item.IsActive)
                .Select(item => item.Id);
        }

        return await _db.ChatConversations.AsNoTracking()
            .Where(item => branchIds.Contains(item.BranchId))
            .OrderByDescending(item => item.LastMessageAt)
            .Select(item => new ChatConversationResponse
            {
                Id = item.Id, Guid = item.Guid, BranchId = item.BranchId,
                BookingGuid = item.Booking == null ? null : item.Booking.Guid,
                CustomerName = item.CustomerName,
                CustomerEmail = item.CustomerEmail,
                CustomerEmailVerified = item.CustomerEmailVerified,
                CustomerAvatarUrl = item.CustomerAvatarUrl,
                Status = item.Status,
                CanSend = item.Status == "ACTIVE" && !item.IsClosed,
                AssignedStaffUserId = item.AssignedStaffUserId,
                LastMessage = item.Messages.OrderByDescending(message => message.SentAt).Select(message => message.Body).FirstOrDefault(),
                LastMessageAt = item.LastMessageAt,
                UnreadCount = item.Messages.Count(message => message.SenderType == "CUSTOMER" && !message.IsRead)
            }).ToListAsync(ct);
    }

    private async Task<int> ResolveConversationIdAsync(string conversationIdOrGuid, CancellationToken ct)
    {
        if (int.TryParse(conversationIdOrGuid, out int id)) return id;
        if (Guid.TryParse(conversationIdOrGuid, out Guid guid))
        {
            var conv = await _db.ChatConversations.AsNoTracking().FirstOrDefaultAsync(c => c.Guid == guid, ct);
            if (conv != null) return conv.Id;
        }
        throw new KeyNotFoundException("Conversation not found.");
    }

    public async Task<List<ChatMessageResponse>> GetShopMessagesAsync(int userId, string conversationIdOrGuid, CancellationToken ct)
    {
        int conversationId = await ResolveConversationIdAsync(conversationIdOrGuid, ct);
        ChatConversation conversation = await _db.ChatConversations.SingleOrDefaultAsync(item => item.Id == conversationId, ct)
            ?? throw new KeyNotFoundException("Conversation not found.");
        await _permissions.EnsureBranchAsync(userId, conversation.BranchId, "branch.view", ct);
        var unread = await _db.ChatMessages.Where(item => item.ConversationId == conversationId && item.SenderType == "CUSTOMER" && !item.IsRead).ToListAsync(ct);
        foreach (var message in unread) message.IsRead = true;
        if (unread.Count > 0) await _db.SaveChangesAsync(ct);
        return await _db.ChatMessages.AsNoTracking().Where(item => item.ConversationId == conversationId).OrderBy(item => item.SentAt)
            .Select(item => new ChatMessageResponse { Id = item.Id, SenderType = item.SenderType, Body = item.Body, SentAt = item.SentAt, IsMine = item.SenderType == "SHOP" }).ToListAsync(ct);
    }

    public async Task<ChatMessageResponse> SendShopMessageAsync(int userId, string conversationIdOrGuid, SendChatMessageRequest request, CancellationToken ct)
    {
        int conversationId = await ResolveConversationIdAsync(conversationIdOrGuid, ct);
        ChatConversation conversation = await _db.ChatConversations.SingleOrDefaultAsync(item => item.Id == conversationId && !item.IsClosed, ct)
            ?? throw new KeyNotFoundException("Conversation not found or closed.");
        await _permissions.EnsureBranchAsync(userId, conversation.BranchId, "branch.view", ct);
        if (conversation.Status != "ACTIVE") throw new InvalidOperationException("Accept the chat request before sending a message.");
        string body = ValidateBody(request.Body);
        var message = new ChatMessage { Guid = Guid.NewGuid(), ConversationId = conversationId, SenderUserId = userId, SenderType = "SHOP", Body = body, SentAt = DateTime.UtcNow };
        _db.ChatMessages.Add(message); conversation.LastMessageAt = message.SentAt;
        await _db.SaveChangesAsync(ct);
        return ToMessage(message, true);
    }

    public async Task<ChatConversationResponse> StartPublicConversationAsync(CreatePublicChatRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName) || request.CustomerName.Trim().Length > 150) throw new InvalidOperationException("Please enter a valid name.");
        ShopBranch branch = await _db.ShopBranches.SingleOrDefaultAsync(item => item.PublicBookingId == request.BranchPublicId && item.Shop.PublicSlug == request.ShopSlug && item.IsActive && item.Shop.IsActive, ct)
            ?? throw new KeyNotFoundException("Shop branch not found.");
        Booking? booking = null;
        if (request.BookingGuid.HasValue)
        {
            if (string.IsNullOrWhiteSpace(request.Token)) throw new UnauthorizedAccessException("A booking token is required.");
            ValidateManagementToken(request.BookingGuid.Value, request.Token);
            booking = await _db.Bookings.Include(item => item.User).SingleOrDefaultAsync(item => item.Guid == request.BookingGuid.Value && item.BranchId == branch.Id, ct)
                ?? throw new KeyNotFoundException("Booking not found.");
            string? bookingEmail = booking.GuestEmail ?? booking.User?.Email;
            if (!string.IsNullOrWhiteSpace(bookingEmail) && !string.Equals(bookingEmail.Trim(), request.CustomerEmail?.Trim(), StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("The email does not match this booking.");
        }
        string? accessToken = booking == null ? CreateAccessToken() : null;
        string? normalizedEmail = request.CustomerEmail?.Trim().ToLowerInvariant();
        bool emailVerified = booking != null && !string.IsNullOrWhiteSpace(normalizedEmail);
        var conversation = new ChatConversation { Guid = Guid.NewGuid(), BranchId = branch.Id, BookingId = booking?.Id, CustomerName = request.CustomerName.Trim(), CustomerEmail = normalizedEmail, CustomerEmailVerified = emailVerified, Status = "PENDING", CustomerTokenHash = accessToken == null ? null : Hash(accessToken), LastMessageAt = DateTime.UtcNow };
        _db.ChatConversations.Add(conversation); await _db.SaveChangesAsync(ct);
        await CreateChatNotificationsAsync(branch.Id, conversation.Id, conversation.CustomerName, ct);
        var result = await ToConversationAsync(conversation.Id, ct);
        result.AccessToken = accessToken;
        return result;
    }

    private async Task CreateChatNotificationsAsync(int branchId, int conversationId, string customerName, CancellationToken ct)
    {
        var staffUserIds = await _db.ShopStaffs.AsNoTracking()
            .Where(s => s.BranchId == branchId && s.IsActive && s.UserId.HasValue)
            .Select(s => s.UserId!.Value)
            .Distinct()
            .ToListAsync(ct);

        int shopId = await _db.ShopBranches.AsNoTracking()
            .Where(b => b.Id == branchId)
            .Select(b => b.ShopId)
            .FirstOrDefaultAsync(ct);
        if (shopId > 0)
        {
            int? ownerUserId = await _db.Shops.AsNoTracking()
                .Where(s => s.Id == shopId)
                .Select(s => s.OwnerId)
                .FirstOrDefaultAsync(ct);
            if (ownerUserId.HasValue && !staffUserIds.Contains(ownerUserId.Value))
            {
                staffUserIds.Add(ownerUserId.Value);
            }
        }

        var unreadStatus = await _db.MasterStatuses.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Type == "NOTIFICATION_STATUS" && s.Code == "UNREAD", ct);
        if (unreadStatus == null) return;

        foreach (int userId in staffUserIds)
        {
            _db.Notifications.Add(new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = userId,
                Type = "CHAT_REQUEST",
                Title = "คำขอสนทนาใหม่จากลูกค้า",
                Message = $"ลูกค้า '{customerName}' ต้องการเปิดห้องแชทสอบถามข้อมูล (ห้องแชท #{conversationId})",
                StatusId = unreadStatus.Id,
                CreatedAt = DateTime.UtcNow
            });
        }
        await _db.SaveChangesAsync(ct);
    }

    public async Task<List<ChatMessageResponse>> GetPublicMessagesAsync(Guid conversationGuid, string? token, CancellationToken ct)
    {
        ChatConversation conversation = await AuthorizePublicConversationAsync(conversationGuid, token, ct);
        return await _db.ChatMessages.AsNoTracking().Where(item => item.ConversationId == conversation.Id).OrderBy(item => item.SentAt)
            .Select(item => new ChatMessageResponse { Id = item.Id, SenderType = item.SenderType, Body = item.Body, SentAt = item.SentAt, IsMine = item.SenderType == "CUSTOMER" }).ToListAsync(ct);
    }

    public async Task<ChatMessageResponse> SendPublicMessageAsync(Guid conversationGuid, SendChatMessageRequest request, CancellationToken ct)
    {
        ChatConversation conversation = await AuthorizePublicConversationAsync(conversationGuid, request.Token, ct);
        if (conversation.Status != "ACTIVE") throw new InvalidOperationException("A staff member must accept the chat before you can send messages.");
        string body = ValidateBody(request.Body);
        var message = new ChatMessage { Guid = Guid.NewGuid(), ConversationId = conversation.Id, SenderType = "CUSTOMER", Body = body, SentAt = DateTime.UtcNow };
        _db.ChatMessages.Add(message); conversation.LastMessageAt = message.SentAt;
        await _db.SaveChangesAsync(ct);
        return ToMessage(message, true);
    }

    public async Task ClosePublicConversationAsync(Guid conversationGuid, string? token, CancellationToken ct)
    {
        // Query directly WITHOUT the auto-close guard so we can still close
        // and notify even if the 30-minute timeout already fired.
        ChatConversation? conversation = await _db.ChatConversations
            .Include(item => item.Booking)
            .SingleOrDefaultAsync(item => item.Guid == conversationGuid, ct)
            ?? throw new KeyNotFoundException("Conversation not found.");

        // Validate token the same way as AuthorizePublicConversationAsync
        if (conversation.Booking != null)
        {
            if (string.IsNullOrWhiteSpace(token)) throw new UnauthorizedAccessException("A booking token is required.");
            ValidateManagementToken(conversation.Booking.Guid, token);
        }
        else if (string.IsNullOrWhiteSpace(token) ||
                 !CryptographicOperations.FixedTimeEquals(
                     Convert.FromHexString(conversation.CustomerTokenHash!),
                     Convert.FromHexString(Hash(token))))
        {
            throw new UnauthorizedAccessException("Invalid chat access token.");
        }

        bool wasAlreadyClosed = conversation.IsClosed;
        conversation.IsClosed = true;
        await _db.SaveChangesAsync(ct);

        // Always notify — even if it was auto-closed (customer may not have seen the close)
        if (!wasAlreadyClosed || conversation.Status == "ACTIVE")
            await CreateChatClosedNotificationsAsync(conversation.BranchId, conversation.Id, conversation.CustomerName, conversation.AssignedStaffUserId, ct);
    }

    private async Task CreateChatClosedNotificationsAsync(int branchId, int conversationId, string customerName, int? assignedUserId, CancellationToken ct)
    {
        var staffUserIds = await _db.ShopStaffs.AsNoTracking()
            .Where(s => s.BranchId == branchId && s.IsActive && s.UserId.HasValue)
            .Select(s => s.UserId!.Value)
            .Distinct()
            .ToListAsync(ct);

        int shopId = await _db.ShopBranches.AsNoTracking()
            .Where(b => b.Id == branchId)
            .Select(b => b.ShopId)
            .FirstOrDefaultAsync(ct);
        if (shopId > 0)
        {
            int? ownerUserId = await _db.Shops.AsNoTracking()
                .Where(s => s.Id == shopId)
                .Select(s => s.OwnerId)
                .FirstOrDefaultAsync(ct);
            if (ownerUserId.HasValue && !staffUserIds.Contains(ownerUserId.Value))
                staffUserIds.Add(ownerUserId.Value);
        }

        var unreadStatus = await _db.MasterStatuses.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Type == "NOTIFICATION_STATUS" && s.Code == "UNREAD", ct);
        if (unreadStatus == null) return;

        // Prioritise assigned staff, include all branch staff as well
        var notifyUserIds = assignedUserId.HasValue && !staffUserIds.Contains(assignedUserId.Value)
            ? staffUserIds.Prepend(assignedUserId.Value).ToList()
            : staffUserIds;

        foreach (int userId in notifyUserIds)
        {
            _db.Notifications.Add(new Notification
            {
                Guid = Guid.NewGuid(),
                UserId = userId,
                Type = "CHAT_CLOSED",
                Title = "ลูกค้าจบการสนทนาแล้ว",
                Message = $"ลูกค้า '{customerName}' ได้จบการสนทนา (ห้องแชท #{conversationId}) แล้ว",
                StatusId = unreadStatus.Id,
                CreatedAt = DateTime.UtcNow
            });
        }
        await _db.SaveChangesAsync(ct);
    }

    public async Task<ChatConversationResponse> UpdatePublicProfileAsync(Guid conversationGuid, UpdatePublicChatProfileRequest request, CancellationToken ct)
    {
        ChatConversation conversation = await AuthorizePublicConversationAsync(conversationGuid, request.Token, ct);
        if (!conversation.CustomerEmailVerified) throw new UnauthorizedAccessException("Email verification is required before changing the profile picture.");
        if (request.ProfilePicture is null || request.ProfilePicture.Length == 0) throw new InvalidOperationException("A profile picture is required.");
        if (request.ProfilePicture.Length > 5 * 1024 * 1024) throw new InvalidOperationException("Profile picture must be 5 MB or smaller.");
        string contentType = request.ProfilePicture.ContentType?.ToLowerInvariant() ?? string.Empty;
        string extension = contentType switch { "image/jpeg" => ".jpg", "image/png" => ".png", "image/webp" => ".webp", _ => throw new InvalidOperationException("Only JPG, PNG, or WebP images are supported.") };
        string folder = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "chat-profiles");
        Directory.CreateDirectory(folder);
        string fileName = $"{conversation.Guid:N}-{Guid.NewGuid():N}{extension}";
        string filePath = Path.Combine(folder, fileName);
        await using (FileStream stream = File.Create(filePath)) await request.ProfilePicture.CopyToAsync(stream, ct);
        if (!string.IsNullOrWhiteSpace(conversation.CustomerAvatarUrl))
        {
            string oldPath = Path.Combine(_environment.ContentRootPath, "wwwroot", conversation.CustomerAvatarUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(oldPath)) File.Delete(oldPath);
        }
        conversation.CustomerAvatarUrl = $"/uploads/chat-profiles/{fileName}";
        await _db.SaveChangesAsync(ct);
        return await ToConversationAsync(conversation.Id, ct);
    }

    public async Task<ChatConversationResponse> GetPublicConversationAsync(Guid conversationGuid, string? token, CancellationToken ct)
    {
        ChatConversation conversation = await AuthorizePublicConversationAsync(conversationGuid, token, ct);
        return await ToConversationAsync(conversation.Id, ct);
    }

    public async Task<ChatConversationResponse> AcceptConversationAsync(int userId, string conversationIdOrGuid, CancellationToken ct)
    {
        int conversationId = await ResolveConversationIdAsync(conversationIdOrGuid, ct);
        ChatConversation conversation = await _db.ChatConversations.SingleOrDefaultAsync(item => item.Id == conversationId && !item.IsClosed, ct)
            ?? throw new KeyNotFoundException("Conversation not found or closed.");
        await _permissions.EnsureBranchAsync(userId, conversation.BranchId, "branch.view", ct);
        conversation.Status = "ACTIVE";
        conversation.AssignedStaffUserId = userId;
        conversation.AcceptedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await ToConversationAsync(conversation.Id, ct);
    }

    private async Task<ChatConversation> AuthorizePublicConversationAsync(Guid guid, string? token, CancellationToken ct)
    {
        ChatConversation conversation = await _db.ChatConversations.Include(item => item.Booking).SingleOrDefaultAsync(item => item.Guid == guid && !item.IsClosed, ct)
            ?? throw new KeyNotFoundException("Conversation not found.");
        if (conversation.Booking != null)
        {
            if (string.IsNullOrWhiteSpace(token)) throw new UnauthorizedAccessException("A booking token is required.");
            ValidateManagementToken(conversation.Booking.Guid, token);
        }
        else if (string.IsNullOrWhiteSpace(token) || !CryptographicOperations.FixedTimeEquals(Convert.FromHexString(conversation.CustomerTokenHash!), Convert.FromHexString(Hash(token))))
            throw new UnauthorizedAccessException("Invalid chat access token.");

        // A conversation is eligible for automatic closure only after the shop has
        // replied and the customer has not replied for 30 minutes. If the shop has
        // never replied (or the customer was the last sender), keep it open.
        ChatMessage? latest = await _db.ChatMessages.AsNoTracking()
            .Where(item => item.ConversationId == conversation.Id)
            .OrderByDescending(item => item.SentAt)
            .FirstOrDefaultAsync(ct);
        if (latest?.SenderType == "SHOP" && DateTime.UtcNow - latest.SentAt >= CustomerReplyTimeout)
        {
            conversation.IsClosed = true;
            await _db.SaveChangesAsync(ct);
            throw new KeyNotFoundException("Conversation expired after 30 minutes without a customer reply.");
        }
        return conversation;
    }

    private async Task<ChatConversationResponse> ToConversationAsync(int id, CancellationToken ct) => await _db.ChatConversations.AsNoTracking().Where(item => item.Id == id).Select(item => new ChatConversationResponse { Id = item.Id, Guid = item.Guid, BranchId = item.BranchId, BookingGuid = item.Booking == null ? null : item.Booking.Guid, CustomerName = item.CustomerName, CustomerEmail = item.CustomerEmail, CustomerEmailVerified = item.CustomerEmailVerified, CustomerAvatarUrl = item.CustomerAvatarUrl, Status = item.Status, CanSend = item.Status == "ACTIVE" && !item.IsClosed, AssignedStaffUserId = item.AssignedStaffUserId, LastMessageAt = item.LastMessageAt }).SingleAsync(ct);
    private static ChatMessageResponse ToMessage(ChatMessage message, bool mine) => new() { Id = message.Id, SenderType = message.SenderType, Body = message.Body, SentAt = message.SentAt, IsMine = mine };
    private static string ValidateBody(string body) { string value = body?.Trim() ?? string.Empty; if (value.Length == 0 || value.Length > 4000) throw new InvalidOperationException("Message must be between 1 and 4000 characters."); return value; }
    private static string CreateAccessToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    private static string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
    private void ValidateManagementToken(Guid bookingGuid, string token)
    {
        string[] parts = token.Split('.', 2);
        if (parts.Length != 2 || !long.TryParse(parts[0], out long expiry) || DateTimeOffset.UtcNow.ToUnixTimeSeconds() > expiry) throw new UnauthorizedAccessException("Invalid booking token.");
        byte[] expected = HMACSHA256.HashData(_managementKey, Encoding.UTF8.GetBytes($"{bookingGuid:N}.{expiry}"));
        string encoded = parts[1].Replace('-', '+').Replace('_', '/'); encoded += new string('=', (4 - encoded.Length % 4) % 4);
        byte[] supplied; try { supplied = Convert.FromBase64String(encoded); } catch { throw new UnauthorizedAccessException("Invalid booking token."); }
        if (!CryptographicOperations.FixedTimeEquals(expected, supplied)) throw new UnauthorizedAccessException("Invalid booking token.");
    }
}
