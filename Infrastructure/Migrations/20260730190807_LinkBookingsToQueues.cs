using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Queue.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LinkBookingsToQueues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BookingId",
                table: "Queues",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                """
                ;WITH MissingCheckedIn AS
                (
                    SELECT
                        b.Id AS BookingId,
                        b.BranchId,
                        service.ServiceId,
                        b.AssignedStaffId,
                        COALESCE(NULLIF(u.Name, ''), NULLIF(b.GuestName, ''), 'Customer') AS CustomerName,
                        COALESCE(
                            (
                                SELECT MAX(existingQueue.QueueNumber)
                                FROM Queues AS existingQueue
                                WHERE existingQueue.BranchId = b.BranchId
                                  AND CAST(existingQueue.CreatedAt AS date) = CAST(GETDATE() AS date)
                            ),
                            0
                        ) AS ExistingMaximum,
                        ROW_NUMBER() OVER
                        (
                            PARTITION BY b.BranchId
                            ORDER BY slot.StartTime, b.Id
                        ) AS QueueOffset,
                        COALESCE(b.UpdatedAt, GETDATE()) AS CheckedInAt,
                        b.UpdatedBy
                    FROM Bookings AS b
                    INNER JOIN MasterStatuses AS bookingStatus
                        ON bookingStatus.Id = b.StatusId
                       AND bookingStatus.Type = 'BOOKING_STATUS'
                       AND bookingStatus.Code = 'CHECKED_IN'
                    INNER JOIN QueueSlots AS slot ON slot.Id = b.QueueSlotId
                    LEFT JOIN Users AS u ON u.Id = b.UserId
                    OUTER APPLY
                    (
                        SELECT TOP (1) bookingService.ServiceId
                        FROM BookingServices AS bookingService
                        WHERE bookingService.BookingId = b.Id
                        ORDER BY bookingService.ServiceId
                    ) AS service
                    WHERE CAST(slot.Date AS date) = CAST(GETDATE() AS date)
                      AND service.ServiceId IS NOT NULL
                      AND NOT EXISTS
                      (
                          SELECT 1
                          FROM Queues AS linkedQueue
                          WHERE linkedQueue.BookingId = b.Id
                      )
                )
                INSERT INTO Queues
                (
                    Guid,
                    BranchId,
                    BookingId,
                    QueueNumber,
                    ServiceId,
                    AssignedStaffId,
                    CustomerName,
                    StatusId,
                    Type,
                    CreatedAt,
                    CreatedBy
                )
                SELECT
                    NEWID(),
                    missing.BranchId,
                    missing.BookingId,
                    missing.ExistingMaximum + missing.QueueOffset,
                    missing.ServiceId,
                    missing.AssignedStaffId,
                    missing.CustomerName,
                    queueStatus.Id,
                    'BOOKING',
                    missing.CheckedInAt,
                    missing.UpdatedBy
                FROM MissingCheckedIn AS missing
                CROSS JOIN MasterStatuses AS queueStatus
                WHERE queueStatus.Type = 'QUEUE_STATUS'
                  AND queueStatus.Code = 'WAITING';

                UPDATE booking
                SET booking.QueueNumber = linkedQueue.QueueNumber
                FROM Bookings AS booking
                INNER JOIN Queues AS linkedQueue ON linkedQueue.BookingId = booking.Id
                WHERE booking.QueueNumber IS NULL;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Queues_BookingId",
                table: "Queues",
                column: "BookingId",
                unique: true,
                filter: "[BookingId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Queues_Booking",
                table: "Queues",
                column: "BookingId",
                principalTable: "Bookings",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Queues_Booking",
                table: "Queues");

            migrationBuilder.DropIndex(
                name: "IX_Queues_BookingId",
                table: "Queues");

            migrationBuilder.DropColumn(
                name: "BookingId",
                table: "Queues");
        }
    }
}
