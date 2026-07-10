using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Serilog;
using Serilog.Filters;
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
builder.Services.AddDbContext<QueueDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
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
builder.Services.AddScoped<IManageCustomer, ManageCustomer>();
#endregion

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Cors");
app.UseStaticFiles();

app.UseMiddleware<LoggingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
var Version = builder.Configuration["Version"];
Console.WriteLine($"======================================== API Start V{Version} ========================================");
app.Run();
