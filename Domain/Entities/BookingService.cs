using System;
using System.Collections.Generic;

namespace Queue.Domain.Entities;

public partial class BookingService
{
    public int BookingId { get; set; }

    public int ServiceId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Booking Booking { get; set; } = null!;

    public virtual Service Service { get; set; } = null!;
}
