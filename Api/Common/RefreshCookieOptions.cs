using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace Queue.Api.Common;

public static class RefreshCookieOptions
{
    public static CookieOptions Build(IHostEnvironment env, int days = 30)
    {
        bool isProd = env.IsProduction();

        return new CookieOptions
        {
            HttpOnly = true,
            Secure = isProd,
            SameSite = isProd
                ? SameSiteMode.Strict
                : SameSiteMode.Lax,

            Path = "/api/v1",
            Expires = DateTimeOffset.UtcNow.AddDays(days)
        };
    }

    public static CookieOptions Delete(IHostEnvironment env)
    {
        return new CookieOptions
        {
            Path = "/api/v1",
            Secure = env.IsProduction(),
            SameSite = env.IsProduction()
                ? SameSiteMode.Strict
                : SameSiteMode.Lax
        };
    }
}
