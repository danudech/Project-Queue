using System.Runtime.InteropServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Queue.Application.DTO.Request;
using Queue.Application.Interfaces;
using Queue.Domain.Entities;
using Queue.Infrastructure.Service;
using Queue.Infrastructure.Services;

namespace Queue.Infrastructure.Persistence.Repositories;

public sealed class ManageCustomer : IManageCustomer
{
    private readonly IActionLog _actionLog;
    private readonly QueueDbContext _db;
    private readonly ICrudService _crud;
    private readonly IConfiguration _config;
    private readonly DateTimeService _dateTime;


    public ManageCustomer(IActionLog actionLog, QueueDbContext db, ICrudService crud, IConfiguration config, DateTimeService dateTime)

    {
        _actionLog = actionLog;
        _db = db;
        _config = config;
        _dateTime = dateTime;
        _crud = crud;

    }

    public async Task<List<CustomerResponse>> GetCustomerById(int userId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching customer data (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);

            List<Customer> customers = await _db.Customers
                .AsNoTracking()
                .Include(c => c.CustomerTagMaps)
                    .ThenInclude(ctm => ctm.Tag)
                .Include(c => c.CustomerNotes)
                .Where(c => c.UserId == userId)
                .ToListAsync(ct);

            if (customers == null || !customers.Any())
            {
                _actionLog.Warning("No customers found (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
                return new List<CustomerResponse>();
            }

            return customers.Select(c => new CustomerResponse
            {
                Id = c.Id,
                ShopId = c.ShopId,
                Name = c.Name,
                Phone = c.Phone,
                IsActive = c.IsActive,
                Tags = c.CustomerTagMaps.Select(t => new CustomerTag
                {
                    Id = t.Tag.Id,
                    Name = t.Tag.Name
                }).ToList(),
                Notes = c.CustomerNotes.Select(n => new CustomerNote
                {
                    Id = n.Id,
                    Note = n.Note,
                    CreatedAt = n.CreatedAt,
                    CreatedBy = n.CreatedBy
                }).ToList(),
                CreatedAt = c.CreatedAt,
                CreatedBy = _db.Users.Where(u => u.Id == c.CreatedBy).Select(u => u.Name).FirstOrDefault() ?? "Unknown"
            }).ToList();
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error fetching customer data (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            return new List<CustomerResponse>();
        }
    }

    public async Task<CustomerResponse> CreateCustomer(int userId, CustomerRequest request, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Creating new customer (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);

            Customer newCustomer = new Customer
            {
                Guid = Guid.NewGuid(),
                ShopId = request.ShopId,
                UserId = userId,
                Name = request.Name,
                Phone = request.Phone,
                IsActive = true,
                CreatedAt = _dateTime.LocalNow(),
                CreatedBy = userId
            };

            await _crud.InsertAsync(newCustomer, ct);

            if (request.Notes != null && request.Notes.Any())
            {
                foreach (var note in request.Notes)
                {
                    CustomerNote customerNote = new CustomerNote
                    {
                        CustomerId = newCustomer.Id,
                        Note = note.Note,
                        CreatedAt = _dateTime.LocalNow(),
                        CreatedBy = userId
                    };
                    await _crud.InsertAsync(customerNote, ct);
                }
            }


            if (request.Tags != null && request.Tags.Any())
            {
                foreach (var tag in request.Tags)
                {
                    CustomerTagMap tagMap = new CustomerTagMap
                    {
                        CustomerId = newCustomer.Id,
                        TagId = tag.Id
                    };
                    await _crud.InsertAsync(tagMap, ct);
                }
            }

            return new CustomerResponse
            {
                Id = newCustomer.Id,
                ShopId = newCustomer.ShopId,
                Name = newCustomer.Name,
                Phone = newCustomer.Phone,
                IsActive = newCustomer.IsActive,
                Tags = request.Tags?.Select(t => new CustomerTag
                {
                    Id = t.Id,
                    Name = t.Name
                }).ToList() ?? new List<CustomerTag>(),
                Notes = newCustomer.CustomerNotes.Select(n => new CustomerNote
                {
                    Id = n.Id,
                    Note = n.Note,
                    CreatedAt = n.CreatedAt,
                    CreatedBy = n.CreatedBy
                }).ToList(),
                CreatedAt = newCustomer.CreatedAt,
                CreatedBy = _db.Users.Where(u => u.Id == newCustomer.CreatedBy).Select(u => u.Name).FirstOrDefault() ?? "Unknown"
            };
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error creating customer (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            throw;
        }
    }

    public async Task<CustomerResponse> UpdateCustomer(int userId, CustomerRequest request, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Updating customer (UserId={UserId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);

            Customer? existingCustomer = await _db.Customers
                .Include(c => c.CustomerTagMaps)
                .FirstOrDefaultAsync(c => c.Id == request.Id && c.UserId == userId, ct);

            if (existingCustomer == null)
            {
                _actionLog.Warning("Customer not found for update (UserId={UserId}, CustomerId={CustomerId}, IP={IP}, UserAgent={UserAgent})", userId, request.Id ?? 0, ip, userAgent);
                throw new Exception("Customer not found");
            }

            existingCustomer.Name = request.Name;
            existingCustomer.Phone = request.Phone;
            existingCustomer.UpdatedAt = _dateTime.LocalNow();
            existingCustomer.UpdatedBy = userId;

            if (request.Notes != null && request.Notes.Any())
            {
                foreach (var note in request.Notes)
                {
                    CustomerNote? existingNote = await _db.CustomerNotes.FirstOrDefaultAsync(n => n.Id == note.Id && n.CustomerId == existingCustomer.Id, ct);
                    if (existingNote != null)
                    {
                        existingNote.Note = note.Note;
                        existingNote.UpdatedAt = _dateTime.LocalNow();
                        existingNote.UpdatedBy = userId;
                        await _crud.UpdateAsync(existingNote, ct);
                    }
                    else
                    {
                        CustomerNote customerNote = new CustomerNote
                        {
                            CustomerId = existingCustomer.Id,
                            Note = note.Note,
                            CreatedAt = _dateTime.LocalNow(),
                            CreatedBy = userId
                        };
                        await _crud.InsertAsync(customerNote, ct);
                    }
                }
            }

            // Update tags
            if (request.Tags != null)
            {
                // Remove old tags
                var oldTags = existingCustomer.CustomerTagMaps.ToList();
                foreach (var oldTag in oldTags)
                {
                    _db.CustomerTagMaps.Remove(oldTag);
                }

                // Add new tags
                foreach (var tag in request.Tags)
                {
                    CustomerTagMap tagMap = new CustomerTagMap
                    {
                        CustomerId = existingCustomer.Id,
                        TagId = tag.Id
                    };
                    await _crud.InsertAsync(tagMap, ct);
                }
            }

            await _crud.UpdateAsync(existingCustomer, ct);

            return new CustomerResponse
            {
                Id = existingCustomer.Id,
                ShopId = existingCustomer.ShopId,
                Name = existingCustomer.Name,
                Phone = existingCustomer.Phone,
                IsActive = existingCustomer.IsActive,
                Tags = request.Tags?.Select(t => new CustomerTag
                {
                    Id = t.Id,
                    Name = t.Name
                }).ToList() ?? new List<CustomerTag>(),
                Notes = existingCustomer.CustomerNotes.Select(n => new CustomerNote
                {
                    Id = n.Id,
                    Note = n.Note,
                    CreatedAt = n.CreatedAt,
                    CreatedBy = n.CreatedBy
                }).ToList(),
                CreatedAt = existingCustomer.CreatedAt,
                CreatedBy = _db.Users.Where(u => u.Id == existingCustomer.CreatedBy).Select(u => u.Name).FirstOrDefault() ?? "Unknown"
            };
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error updating customer (UserId={UserId}, CustomerId={CustomerId}, IP={IP}, UserAgent={UserAgent})", userId, request.Id ?? 0, ip, userAgent);
            throw;
        }
    }

    public async Task DeleteCustomer(int userId, int customerId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Deleting customer (UserId={UserId}, CustomerId={CustomerId}, IP={IP}, UserAgent={UserAgent})", userId, customerId, ip, userAgent);

            Customer? existingCustomer = await _db.Customers.FirstOrDefaultAsync(c => c.Id == customerId, ct);

            if (existingCustomer == null)
            {
                _actionLog.Warning("Customer not found for deletion (UserId={UserId}, CustomerId={CustomerId}, IP={IP}, UserAgent={UserAgent})", userId, customerId, ip, userAgent);
                throw new Exception("Customer not found");
            }

            List<CustomerTagMap> tagMaps = await _db.CustomerTagMaps.Where(tm => tm.CustomerId == customerId).ToListAsync(ct);
            _db.CustomerTagMaps.RemoveRange(tagMaps);

            List<CustomerNote> notes = await _db.CustomerNotes.Where(n => n.CustomerId == customerId).ToListAsync(ct);
            _db.CustomerNotes.RemoveRange(notes);
            _db.Customers.Remove(existingCustomer);
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error deleting customer (UserId={UserId}, CustomerId={CustomerId}, IP={IP}, UserAgent={UserAgent})", userId, customerId, ip, userAgent);
            throw;
        }
    }

    public async Task<List<CustomerTag>> GetCustomersByShopId(int userId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching customers by shop ID (UserId={UserId}, ShopId={ShopId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            return await _db.CustomerTags.Where(ct => ct.IsActive).ToListAsync(ct);

        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error fetching customers by shop ID (UserId={UserId}, ShopId={ShopId}, IP={IP}, UserAgent={UserAgent})", userId, ip, userAgent);
            return new List<CustomerTag>();
        }
    }

    public async Task<List<CustomerTag>> GetCustomerTagsById(int customerId, string ip, string userAgent, CancellationToken ct)
    {
        try
        {
            _actionLog.Info("Fetching customer tags (CustomerId={CustomerId}, IP={IP}, UserAgent={UserAgent})", customerId, ip, userAgent);

            List<CustomerTag> tags = await _db.CustomerTags
                .AsNoTracking()
                .Where(ct => ct.IsActive)
                .ToListAsync(ct);

            return tags;
        }
        catch (Exception ex)
        {
            _actionLog.Error(ex, "Error fetching customer tags (CustomerId={CustomerId}, IP={IP}, UserAgent={UserAgent})", customerId, ip, userAgent);
            return new List<CustomerTag>();
        }
    }
}