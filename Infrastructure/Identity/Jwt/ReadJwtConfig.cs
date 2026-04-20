using Microsoft.Extensions.Configuration;

namespace Queue.Infrastructure.Identity.Jwt;

public sealed class ReadJwtConfig
{
    public string Issuer { get; }
    public string UserMigration { get; }
    public string Audience { get; }
    public string SignKey { get; }
    public byte[] EncKeyBytes { get; }
    public int AccessMins { get; }
    public int RefreshDays { get; }

    public ReadJwtConfig(IConfiguration cfg)
    {
        var jwt = cfg.GetSection("Jwt");

        Issuer = jwt["Issuer"] ?? throw new Exception("Jwt:Issuer missing");
        UserMigration = jwt["UserMigration"] ?? throw new Exception("Jwt:UserMigration missing");
        Audience = jwt["Audience"] ?? throw new Exception("Jwt:Audience missing");
        SignKey = jwt["SignKey"] ?? throw new Exception("Jwt:SignKey missing");
        var encKeyB64 = jwt["EncKey"] ?? throw new Exception("Jwt:EncKey missing");

        byte[] encBytes;
        try
        {
            encBytes = Convert.FromBase64String(encKeyB64);
        }
        catch
        {
            throw new Exception("Jwt:EncKey is not valid Base64");
        }

        if (encBytes.Length != 32)
            throw new Exception($"Jwt:EncKey must decode to 32 bytes but got {encBytes.Length} bytes.");

        EncKeyBytes = encBytes;

        AccessMins = ReadInt(jwt, "AccessTokenMinutes", defaultValue: 30, min: 1, max: 24 * 60);
        RefreshDays = ReadInt(jwt, "RefreshTokenDays", defaultValue: 14, min: 1, max: 365);
    }

    private static int ReadInt(IConfigurationSection section, string key, int defaultValue, int min, int max)
    {
        var raw = section[key]?.Trim();
        raw = raw?.Trim().Replace(",", "");

        if (string.IsNullOrWhiteSpace(raw))
            return defaultValue;

        if (!int.TryParse(raw, out var value))
            throw new Exception($"Jwt:{key} must be an integer but got '{raw}'");

        if (value < min || value > max)
            throw new Exception($"Jwt:{key} must be between {min} and {max} but got {value}");

        return value;
    }
}
