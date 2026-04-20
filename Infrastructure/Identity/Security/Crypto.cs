using System;
using System.Security.Cryptography;

namespace Queue.Infrastructure.Identity.Security;

public static class Crypto
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 200000;
    private static readonly HashAlgorithmName HashAlg = HashAlgorithmName.SHA256;

    public static string HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password is required.", nameof(password));

        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);

        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            password: password,
            salt: salt,
            iterations: Iterations,
            hashAlgorithm: HashAlg,
            outputLength: KeySize
        );

        return $"PBKDF2$sha256${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool VerifyPassword(string password, string stored)
    {
        if (string.IsNullOrWhiteSpace(password)) return false;
        if (string.IsNullOrWhiteSpace(stored)) return false;

        var parts = stored.Split('$', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length != 5) return false;

        if (!string.Equals(parts[0], "PBKDF2", StringComparison.OrdinalIgnoreCase))
            return false;

        if (!string.Equals(parts[1], "sha256", StringComparison.OrdinalIgnoreCase))
            return false;

        if (!int.TryParse(parts[2], out int iterations) || iterations <= 0)
            return false;

        byte[] salt;
        byte[] expectedHash;

        try
        {
            salt = Convert.FromBase64String(parts[3]);
            expectedHash = Convert.FromBase64String(parts[4]);
        }
        catch
        {
            return false;
        }

        byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(
            password: password,
            salt: salt,
            iterations: iterations,
            hashAlgorithm: HashAlg,
            outputLength: expectedHash.Length
        );

        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
}
