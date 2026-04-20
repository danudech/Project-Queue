using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Queue.Infrastructure.Persistence;

namespace Queue.Infrastructure.Migrations;

public class QueueDbContextFactory : IDesignTimeDbContextFactory<QueueDbContext>
{
    public QueueDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();

        // ตอนรันคำสั่งจาก root solution ให้ชี้ไป API
        var apiPath = Path.Combine(basePath, "Queue.API");

        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.Exists(apiPath) ? apiPath : basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var cs = config.GetConnectionString("Default");

        var options = new DbContextOptionsBuilder<QueueDbContext>()
            .UseSqlServer(cs, sql => sql.MigrationsAssembly("Queue.Infrastructure"))
            .Options;

        return new QueueDbContext(options);
    }
}
