using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.RateLimiting;
using Serilog;
using Serilog.Filters;
using System.Threading.RateLimiting;
using System.Text;
using Queue.Infrastructure.Persistence;
using Queue.Api.Middlewares.Logging;
using Queue.Application.Interfaces;
using Queue.Infrastructure.Repositories;
using Queue.Infrastructure.Identity.Jwt;
using Queue.Infrastructure.Persistence.Repositories;
using Queue.Infrastructure.Service;
using Queue.Infrastructure.Services;


DotNetEnv.Env.Load();
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("public-booking-read", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 90,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
    options.AddPolicy("public-booking-write", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 8,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

#region  JWT
string jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer is missing in configuration.");
string jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience is missing in configuration.");
string jwtKey = builder.Configuration["Jwt:SignKey"] ?? throw new InvalidOperationException("Jwt:SignKey is missing in configuration.");
string encKey = builder.Configuration["Jwt:EncKey"] ?? throw new InvalidOperationException("Jwt:EncKey is missing in configuration.");
if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("Jwt:SignKey is missing in configuration.");

string[] allowedOrigins = builder.Configuration.GetSection("AllowAnyOrigin:Origins").Get<string[]>() ?? throw new InvalidOperationException("AllowAnyOrigin:Origins is missing in configuration.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.RequireHttpsMetadata = false;
        opt.SaveToken = true;

        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = !string.IsNullOrWhiteSpace(jwtIssuer),
            ValidIssuer = jwtIssuer,

            ValidateAudience = !string.IsNullOrWhiteSpace(jwtAudience),
            ValidAudience = jwtAudience,

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),

            TokenDecryptionKey = new SymmetricSecurityKey(Convert.FromBase64String(encKey)),
        };
    });

builder.Services.AddAuthorization();
#endregion

#region Swagger + JWT Authorize
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Queue API",
        Version = "v0.0.1"
    });

    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("bearer", document)] = []
    });
});
#endregion

#region Logging Middleware
Log.Logger = new LoggerConfiguration()
   .MinimumLevel.Information()
   .Enrich.FromLogContext()
   .WriteTo.Console()
   .WriteTo.File(
       path: "Logs/system/api-.log",
       rollingInterval: RollingInterval.Day,
       retainedFileCountLimit: 30,
       fileSizeLimitBytes: 10_000_000,
       rollOnFileSizeLimit: true,
       shared: true,
       outputTemplate:
           "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
   )
   .WriteTo.Logger(lc => lc
        .Filter.ByIncludingOnly(Matching.WithProperty<string>("LogSet", p => p == "Custom"))
        .WriteTo.File(
            path: "Logs/action/actionlogs-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 30,
            rollOnFileSizeLimit: true,
            shared: true,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
        )
    )
   .CreateLogger();
builder.Host.UseSerilog();
#endregion

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("Cors", p =>
        p.WithOrigins(allowedOrigins)
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowAnyMethod()
         .AllowCredentials()
    );
});
#region SQL
builder.Services.AddDbContext<QueueDbContext>(options => options
    .UseSqlServer(builder.Configuration.GetConnectionString("Default"))
    // The project keeps a squashed baseline migration plus additive deployment
    // migrations. Do not block applying an additive migration when the snapshot
    // is intentionally behind the runtime model.
    .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning)));
#endregion
#region Services
builder.Services.AddSingleton<ReadJwtConfig>();
builder.Services.AddSingleton<AccessToken>();
builder.Services.AddSingleton<IActionLog, ActionLog>();
builder.Services.AddScoped<IAuthentication, Authentication>();
builder.Services.AddScoped<RefreshToken>();
builder.Services.AddScoped<ICrudService, CrudService>();
builder.Services.AddScoped<IUsers, Users>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IManageShop, ManageShop>();
builder.Services.AddScoped<IAddress, AddressRepository>();
builder.Services.AddSingleton<DateTimeService>();
builder.Services.AddScoped<RoleClaimsService>();
builder.Services.AddScoped<AccountShopGuard>();
builder.Services.AddScoped<PermissionScopeService>();
builder.Services.AddScoped<IManageCustomer, ManageCustomer>();
builder.Services.AddScoped<IOperations, Operations>();
builder.Services.AddScoped<IPublicBooking, PublicBooking>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IRoleManagement, RoleManagement>();
#endregion

var app = builder.Build();

// Keep local/legacy databases usable while additive migrations are being rolled
// out. This is idempotent and only creates the chat tables when they are absent.
// The matching EF migration remains the source of truth for new environments.
await using (var schemaScope = app.Services.CreateAsyncScope())
{
    var db = schemaScope.ServiceProvider.GetRequiredService<QueueDbContext>();
    await db.Database.ExecuteSqlRawAsync(@"
IF OBJECT_ID(N'dbo.ChatConversations', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ChatConversations (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_ChatConversations PRIMARY KEY,
        Guid uniqueidentifier NOT NULL CONSTRAINT DF_ChatConversations_Guid DEFAULT NEWID(),
        BranchId int NOT NULL,
        BookingId int NULL,
        CustomerUserId int NULL,
        CustomerName nvarchar(150) NOT NULL,
        CustomerEmail nvarchar(254) NULL,
        CustomerEmailVerified bit NOT NULL CONSTRAINT DF_ChatConversations_CustomerEmailVerified DEFAULT 0,
        CustomerAvatarUrl nvarchar(500) NULL,
        Status nvarchar(20) NOT NULL CONSTRAINT DF_ChatConversations_Status DEFAULT 'PENDING',
        AssignedStaffUserId int NULL,
        AcceptedAt datetime2 NULL,
        CustomerTokenHash nvarchar(128) NULL,
        LastMessageAt datetime2 NOT NULL CONSTRAINT DF_ChatConversations_LastMessageAt DEFAULT GETDATE(),
        IsClosed bit NOT NULL CONSTRAINT DF_ChatConversations_IsClosed DEFAULT 0,
        CONSTRAINT FK_ChatConversations_ShopBranches_BranchId FOREIGN KEY (BranchId) REFERENCES dbo.ShopBranches(Id),
        CONSTRAINT FK_ChatConversations_Bookings_BookingId FOREIGN KEY (BookingId) REFERENCES dbo.Bookings(Id) ON DELETE SET NULL,
        CONSTRAINT FK_ChatConversations_Users_CustomerUserId FOREIGN KEY (CustomerUserId) REFERENCES dbo.Users(Id) ON DELETE SET NULL
    );
    CREATE UNIQUE INDEX IX_ChatConversations_Guid ON dbo.ChatConversations(Guid);
    CREATE INDEX IX_ChatConversations_BranchId_LastMessageAt ON dbo.ChatConversations(BranchId, LastMessageAt);
END;
IF COL_LENGTH(N'dbo.ChatConversations', N'CustomerEmail') IS NULL ALTER TABLE dbo.ChatConversations ADD CustomerEmail nvarchar(254) NULL;
IF COL_LENGTH(N'dbo.ChatConversations', N'CustomerEmailVerified') IS NULL ALTER TABLE dbo.ChatConversations ADD CustomerEmailVerified bit NOT NULL CONSTRAINT DF_ChatConversations_CustomerEmailVerified DEFAULT 0;
IF COL_LENGTH(N'dbo.ChatConversations', N'CustomerAvatarUrl') IS NULL ALTER TABLE dbo.ChatConversations ADD CustomerAvatarUrl nvarchar(500) NULL;
IF COL_LENGTH(N'dbo.ChatConversations', N'Status') IS NULL ALTER TABLE dbo.ChatConversations ADD Status nvarchar(20) NOT NULL CONSTRAINT DF_ChatConversations_Status DEFAULT 'PENDING';
IF COL_LENGTH(N'dbo.ChatConversations', N'AssignedStaffUserId') IS NULL ALTER TABLE dbo.ChatConversations ADD AssignedStaffUserId int NULL;
IF COL_LENGTH(N'dbo.ChatConversations', N'AcceptedAt') IS NULL ALTER TABLE dbo.ChatConversations ADD AcceptedAt datetime2 NULL;
IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NOT NULL EXEC(N'UPDATE c SET Status = ''ACTIVE'' FROM dbo.ChatConversations c WHERE c.Status = ''PENDING'' AND EXISTS (SELECT 1 FROM dbo.ChatMessages m WHERE m.ConversationId = c.Id)');
IF OBJECT_ID(N'dbo.ChatMessages', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ChatMessages (
        Id int IDENTITY(1,1) NOT NULL CONSTRAINT PK_ChatMessages PRIMARY KEY,
        Guid uniqueidentifier NOT NULL CONSTRAINT DF_ChatMessages_Guid DEFAULT NEWID(),
        ConversationId int NOT NULL,
        SenderUserId int NULL,
        SenderType nvarchar(20) NOT NULL,
        Body nvarchar(4000) NOT NULL,
        SentAt datetime2 NOT NULL CONSTRAINT DF_ChatMessages_SentAt DEFAULT GETDATE(),
        IsRead bit NOT NULL CONSTRAINT DF_ChatMessages_IsRead DEFAULT 0,
        CONSTRAINT FK_ChatMessages_ChatConversations_ConversationId FOREIGN KEY (ConversationId) REFERENCES dbo.ChatConversations(Id) ON DELETE CASCADE,
        CONSTRAINT FK_ChatMessages_Users_SenderUserId FOREIGN KEY (SenderUserId) REFERENCES dbo.Users(Id) ON DELETE SET NULL
    );
    CREATE UNIQUE INDEX IX_ChatMessages_Guid ON dbo.ChatMessages(Guid);
    CREATE INDEX IX_ChatMessages_ConversationId_SentAt ON dbo.ChatMessages(ConversationId, SentAt);
END");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Cors");
app.UseStaticFiles();

app.UseMiddleware<LoggingMiddleware>();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
var Version = builder.Configuration["Version"];
Console.WriteLine($"======================================== API Start V{Version} ========================================");
app.Run();
