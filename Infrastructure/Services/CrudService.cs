
using Queue.Application.Interfaces;
using Queue.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Queue.Infrastructure.Service;

public interface ICrudService
{
    Task<T> InsertAsync<T>(T entity, CancellationToken ct = default)
        where T : class;

    Task<T> UpdateAsync<T>(T entity, CancellationToken ct = default)
        where T : class;

    Task<bool> DeleteAsync<T>(T entity, CancellationToken ct = default)
        where T : class;
    Task<bool> DeleteRangeAsync<T>(IEnumerable<T> entities, CancellationToken ct = default)
        where T : class;

    Task<bool> DeleteByIdAsync<T, TKey>(TKey id, CancellationToken ct = default)
        where T : class;

    Task<T?> GetByIdAsync<T, TKey>(TKey id, CancellationToken ct = default)
        where T : class;
}

public sealed class CrudService : ICrudService
{
    private readonly QueueDbContext _db;

    public CrudService(QueueDbContext db)
    {
        _db = db;
    }

    public async Task<T> InsertAsync<T>(T entity, CancellationToken ct = default)
        where T : class
    {
        await _db.Set<T>().AddAsync(entity, ct);
        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<T?> GetByIdAsync<T, TKey>(TKey id, CancellationToken ct = default)
        where T : class
    {
        return await _db.Set<T>().FindAsync(new object?[] { id }, ct);
    }

    public async Task<T> UpdateAsync<T>(T entity, CancellationToken ct = default)
        where T : class
    {
        var entry = _db.Entry(entity);

        if (entry.State == EntityState.Detached)
        {
            _db.Set<T>().Attach(entity);
            entry = _db.Entry(entity);
        }

        entry.State = EntityState.Modified;

        await _db.SaveChangesAsync(ct);
        return entity;
    }

    public async Task<bool> DeleteAsync<T>(T entity, CancellationToken ct = default)
        where T : class
    {
        var entry = _db.Entry(entity);

        if (entry.State == EntityState.Detached)
            _db.Set<T>().Attach(entity);

        _db.Set<T>().Remove(entity);

        return await _db.SaveChangesAsync(ct) > 0;
    }

    public async Task<bool> DeleteRangeAsync<T>(IEnumerable<T> entities, CancellationToken ct = default)
    where T : class
    {
        foreach (var entity in entities)
        {
            var entry = _db.Entry(entity);

            if (entry.State == EntityState.Detached)
                _db.Set<T>().Attach(entity);

            _db.Set<T>().RemoveRange(entity);
        }

        return await _db.SaveChangesAsync(ct) > 0;
    }

    public async Task<bool> DeleteByIdAsync<T, TKey>(TKey id, CancellationToken ct = default)
        where T : class
    {
        var entity = await GetByIdAsync<T, TKey>(id, ct);
        if (entity == null) return false;

        _db.Set<T>().Remove(entity);
        return await _db.SaveChangesAsync(ct) > 0;
    }
}