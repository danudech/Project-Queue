using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Queue.Application.DTO.Request;
using Queue.Domain.Entities;
using Queue.Infrastructure.Persistence;
using Queue.Infrastructure.Persistence.Repositories;
using Queue.Infrastructure.Services;
using Xunit;

namespace Queue.Tests;

public sealed class OperationsBookingRuleTests
{
    [Fact]
    public async Task Slot_generation_is_order_independent_and_uses_branch_capacity()
    {
        CancellationToken ct = TestContext.Current.CancellationToken;
        await using QueueDbContext db = CreateDb();
        DateTime date = LocalTomorrow();
        SeedBranch(db, date);
        ShopStaff first = Staff(1);
        ShopStaff second = Staff(2);
        Service narrow = Service(1, interval: 30);
        Service wide = Service(2, interval: 15);
        Map(narrow, first);
        Map(wide, first);
        Map(wide, second);
        db.AddRange(first, second, narrow, wide);
        await db.SaveChangesAsync(ct);

        Operations operations = CreateOperations(db);
        var narrowSlots = await operations.GetSlotsAsync(1, date, narrow.Id, ct);
        var wideSlots = await operations.GetSlotsAsync(1, date, wide.Id, ct);

        Assert.Equal("09:00", narrowSlots[0].StartTime);
        Assert.Equal("09:30", narrowSlots[1].StartTime);
        Assert.Equal("09:00", wideSlots[0].StartTime);
        Assert.Equal("09:15", wideSlots[1].StartTime);
        Assert.Single(narrowSlots[0].AvailableStaffIds);
        Assert.Contains(first.Id, narrowSlots[0].AvailableStaffIds);
        Assert.Equal(2, wideSlots[0].AvailableStaffIds.Count);
        Assert.Contains(first.Id, wideSlots[0].AvailableStaffIds);
        Assert.Contains(second.Id, wideSlots[0].AvailableStaffIds);
        Assert.All(await db.QueueSlots.Where(slot => slot.Date.Date == date.Date).ToListAsync(ct),
            slot => Assert.Equal(2, slot.MaxQueue));
    }

    [Fact]
    public async Task Existing_service_uses_its_own_buffer_when_checking_overlap()
    {
        CancellationToken ct = TestContext.Current.CancellationToken;
        await using QueueDbContext db = CreateDb();
        DateTime date = LocalTomorrow();
        SeedBranch(db, date);
        ShopStaff staff = Staff(1);
        Service existingService = Service(1, interval: 30, buffer: 30);
        Service requestedService = Service(2, interval: 30, buffer: 0);
        Map(existingService, staff);
        Map(requestedService, staff);
        db.AddRange(staff, existingService, requestedService);
        await db.SaveChangesAsync(ct);

        Operations operations = CreateOperations(db);
        var generated = await operations.GetSlotsAsync(1, date, existingService.Id, ct);
        int nineOClockSlotId = generated.Single(slot => slot.StartTime == "09:00").Id;
        var waiting = new MasterStatus
        {
            Id = 1, Type = "BOOKING_STATUS", Code = "WAITING",
            NameTh = "รอ", NameEn = "Waiting", IsActive = true, CreatedAt = DateTime.UtcNow
        };
        var booking = new Booking
        {
            Id = 1, Guid = Guid.NewGuid(), BranchId = 1, QueueSlotId = nineOClockSlotId,
            AssignedStaffId = staff.Id, StatusId = waiting.Id, CreatedAt = DateTime.UtcNow
        };
        booking.BookingServices.Add(new BookingService
        {
            BookingId = booking.Id, ServiceId = existingService.Id, CreatedAt = DateTime.UtcNow
        });
        db.AddRange(waiting, booking);
        await db.SaveChangesAsync(ct);

        var available = await operations.GetSlotsAsync(1, date, requestedService.Id, ct);

        Assert.DoesNotContain(available, slot => slot.StartTime == "09:30");
        Assert.Contains(available, slot => slot.StartTime == "10:00");
    }

    [Fact]
    public async Task Create_booking_rejects_a_shared_slot_outside_service_interval()
    {
        CancellationToken ct = TestContext.Current.CancellationToken;
        await using QueueDbContext db = CreateDb();
        DateTime date = LocalTomorrow();
        SeedBranch(db, date);
        ShopStaff staff = Staff(1);
        Service thirtyMinuteService = Service(1, interval: 30);
        Service fifteenMinuteService = Service(2, interval: 15);
        Map(thirtyMinuteService, staff);
        Map(fifteenMinuteService, staff);
        db.AddRange(staff, thirtyMinuteService, fifteenMinuteService);
        await db.SaveChangesAsync(ct);

        Operations operations = CreateOperations(db);
        var slots = await operations.GetSlotsAsync(1, date, fifteenMinuteService.Id, ct);
        int invalidSlotId = slots.Single(slot => slot.StartTime == "09:15").Id;

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            operations.CreateBookingAsync(null, new CreateBookingRequest
            {
                BranchId = 1,
                ServiceId = thirtyMinuteService.Id,
                QueueSlotId = invalidSlotId,
                GuestName = "Guest",
                GuestPhone = "0812345678"
            }, ct));

        Assert.Contains("not valid", error.Message);
    }

    private static QueueDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<QueueDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new QueueDbContext(options);
    }

    private static Operations CreateOperations(QueueDbContext db)
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(
            new Dictionary<string, string?> { ["AppSettings:TimeZoneId"] = "SE Asia Standard Time" }).Build();
        return new Operations(db, null!, null!, null!, null!, new DateTimeService(configuration));
    }

    private static DateTime LocalTomorrow() => DateTime.UtcNow.AddHours(7).Date.AddDays(1);

    private static void SeedBranch(QueueDbContext db, DateTime date)
    {
        db.Shops.Add(new Shop { Id = 1, Guid = Guid.NewGuid(), Name = "Shop", IsActive = true, CreatedAt = DateTime.UtcNow });
        db.ShopBranches.Add(new ShopBranch { Id = 1, Guid = Guid.NewGuid(), ShopId = 1, Name = "Branch", Phone = "0", IsActive = true, CreatedAt = DateTime.UtcNow });
        db.ShopBusinessHours.Add(new ShopBusinessHour { BranchId = 1, DayOfWeek = (int)date.DayOfWeek, OpenTime = new TimeOnly(9, 0), CloseTime = new TimeOnly(18, 0), IsActive = true });
        db.ShopSettings.AddRange(
            new ShopSetting { ShopId = 1, BranchId = 1, Key = "queue.slot_interval", Value = "30", CreatedAt = DateTime.UtcNow },
            new ShopSetting { ShopId = 1, BranchId = 1, Key = "queue.advance_booking_window", Value = "14", CreatedAt = DateTime.UtcNow },
            new ShopSetting { ShopId = 1, BranchId = 1, Key = "queue.buffer_between_services", Value = "10", CreatedAt = DateTime.UtcNow });
    }

    private static ShopStaff Staff(int id) => new()
    {
        Id = id, ShopId = 1, BranchId = 1, Name = $"Staff {id}", Role = "STAFF",
        IsActive = true, IsAvailable = true, CanServeQueues = true, CreatedAt = DateTime.UtcNow
    };

    private static Service Service(int id, int interval, int? buffer = null) => new()
    {
        Id = id, Guid = Guid.NewGuid(), ShopId = 1, BranchId = 1, Name = $"Service {id}",
        Duration = 30, Price = 100, StaffSelectionMode = "OPTIONAL", IsActive = true,
        SlotInterval = interval, BufferBetweenServices = buffer, CreatedAt = DateTime.UtcNow
    };

    private static void Map(Service service, ShopStaff staff) =>
        service.ServiceStaffMaps.Add(new ServiceStaffMap
        {
            ServiceId = service.Id, StaffId = staff.Id, CreatedAt = DateTime.UtcNow
        });
}
