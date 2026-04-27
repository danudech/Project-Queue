using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Queue.Domain.Entities;

namespace Queue.Infrastructure.Persistence;


public partial class QueueDbContext : DbContext
{
    public QueueDbContext()
    {
    }

    public QueueDbContext(DbContextOptions<QueueDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Address> Addresses { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<BookingService> BookingServices { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<CustomerNote> CustomerNotes { get; set; }

    public virtual DbSet<CustomerTag> CustomerTags { get; set; }

    public virtual DbSet<CustomerTagMap> CustomerTagMaps { get; set; }

    public virtual DbSet<District> Districts { get; set; }

    public virtual DbSet<EmailConfirmation> EmailConfirmations { get; set; }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<MasterStatus> MasterStatuses { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<NotificationLog> NotificationLogs { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PaymentTransaction> PaymentTransactions { get; set; }

    public virtual DbSet<Province> Provinces { get; set; }

    public virtual DbSet<Domain.Entities.Queue> Queues { get; set; }

    public virtual DbSet<QueueCategory> QueueCategories { get; set; }

    public virtual DbSet<QueueLog> QueueLogs { get; set; }

    public virtual DbSet<QueueSlot> QueueSlots { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Domain.Entities.Service> Services { get; set; }

    public virtual DbSet<ServiceCategory> ServiceCategories { get; set; }

    public virtual DbSet<ServiceCategoryMap> ServiceCategoryMaps { get; set; }

    public virtual DbSet<ServiceStaffMap> ServiceStaffMaps { get; set; }

    public virtual DbSet<Shop> Shops { get; set; }

    public virtual DbSet<ShopBranch> ShopBranches { get; set; }

    public virtual DbSet<ShopBusinessHour> ShopBusinessHours { get; set; }

    public virtual DbSet<ShopHoliday> ShopHolidays { get; set; }

    public virtual DbSet<ShopSetting> ShopSettings { get; set; }

    public virtual DbSet<ShopStaff> ShopStaffs { get; set; }

    public virtual DbSet<Subdistrict> Subdistricts { get; set; }

    public virtual DbSet<Subscription> Subscriptions { get; set; }

    public virtual DbSet<SystemConfig> SystemConfigs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAuthentication> UserAuthentications { get; set; }

    public virtual DbSet<UserImage> UserImages { get; set; }

    public virtual DbSet<UserRoleMap> UserRoleMaps { get; set; }

    public virtual DbSet<UserSession> UserSessions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Address>(entity =>
        {
            entity.Property(e => e.HouseNo).HasMaxLength(50);
            entity.Property(e => e.Street).HasMaxLength(100);
            entity.Property(e => e.Zipcode).HasMaxLength(10);

            entity.HasOne(d => d.District).WithMany(p => p.Addresses)
                .HasForeignKey(d => d.DistrictId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Addr_Dist");

            entity.HasOne(d => d.Province).WithMany(p => p.Addresses)
                .HasForeignKey(d => d.ProvinceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Addr_Prov");

            entity.HasOne(d => d.Subdistrict).WithMany(p => p.Addresses)
                .HasForeignKey(d => d.SubdistrictId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Addr_Sub");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.Property(e => e.Action).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.RecordId).HasMaxLength(100);
            entity.Property(e => e.TableName).HasMaxLength(100);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasIndex(e => e.Guid, "IX_Bookings_Guid").IsUnique();

            entity.HasIndex(e => e.QueueCategoryId, "IX_Bookings_QueueCategoryId");

            entity.HasIndex(e => e.QueueNumber, "IX_Bookings_QueueNumber");

            entity.HasIndex(e => e.QueueSlotId, "IX_Bookings_QueueSlotId");

            entity.HasIndex(e => e.StatusId, "IX_Bookings_StatusId");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Branch).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bookings_Branch");

            entity.HasOne(d => d.QueueCategory).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.QueueCategoryId)
                .HasConstraintName("FK_Bookings_Category");

            entity.HasOne(d => d.QueueSlot).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.QueueSlotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bookings_Slot");

            entity.HasOne(d => d.Shop).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bookings_Shop");

            entity.HasOne(d => d.Status).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bookings_Status");

            entity.HasOne(d => d.User).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bookings_User");
        });

        modelBuilder.Entity<BookingService>(entity =>
        {
            entity.HasKey(e => new { e.BookingId, e.ServiceId });

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Booking).WithMany(p => p.BookingServices)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BS_Booking");

            entity.HasOne(d => d.Service).WithMany(p => p.BookingServices)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BS_Service");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(e => e.Guid, "IX_Customers_Guid").IsUnique();

            entity.HasIndex(e => e.ShopId, "IX_Customers_ShopId");

            entity.HasIndex(e => new { e.UserId, e.ShopId }, "IX_Customers_UserId_ShopId").IsUnique();

            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Phone).HasMaxLength(20);

            entity.HasOne(d => d.Shop).WithMany(p => p.Customers)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Customers_Shop");

            entity.HasOne(d => d.User).WithMany(p => p.Customers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Customers_User");
        });

        modelBuilder.Entity<CustomerNote>(entity =>
        {
            entity.HasOne(d => d.Customer).WithMany(p => p.CustomerNotes)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CustomerNotes_Customer");
        });

        modelBuilder.Entity<CustomerTag>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<CustomerTagMap>(entity =>
        {
            entity.HasKey(e => new { e.CustomerId, e.TagId });

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Customer).WithMany(p => p.CustomerTagMaps)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CTM_Customer");

            entity.HasOne(d => d.Tag).WithMany(p => p.CustomerTagMaps)
                .HasForeignKey(d => d.TagId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CTM_Tag");
        });

        modelBuilder.Entity<District>(entity =>
        {
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.NameTh).HasMaxLength(100);

            entity.HasOne(d => d.Province).WithMany(p => p.Districts)
                .HasForeignKey(d => d.ProvinceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Districts_Provinces");
        });

        modelBuilder.Entity<EmailConfirmation>(entity =>
        {
            entity.HasIndex(e => e.Token, "IX_EmailConfirmations_Token");

            entity.HasIndex(e => e.TokenHash, "IX_EmailConfirmations_TokenHash");

            entity.HasIndex(e => e.UserId, "IX_EmailConfirmations_UserId");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Token).HasMaxLength(200);
            entity.Property(e => e.TokenHash).HasMaxLength(500);

            entity.HasOne(d => d.User).WithMany(p => p.EmailConfirmations)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_EmailConfirmations_User");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Shop).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Invoices_Shop");

            entity.HasOne(d => d.Status).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Invoices_Status");
        });

        modelBuilder.Entity<MasterStatus>(entity =>
        {
            entity.HasIndex(e => new { e.Type, e.Code }, "IX_MasterStatuses_Type_Code").IsUnique();

            entity.Property(e => e.Code).HasMaxLength(50);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.NameEn).HasMaxLength(150);
            entity.Property(e => e.NameTh).HasMaxLength(150);
            entity.Property(e => e.Type).HasMaxLength(50);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Title).HasMaxLength(150);
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.Status).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notifications_Status");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notifications_User");
        });

        modelBuilder.Entity<NotificationLog>(entity =>
        {
            entity.HasOne(d => d.Notification).WithMany(p => p.NotificationLogs)
                .HasForeignKey(d => d.NotificationId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_NotificationLogs_Notification");

            entity.HasOne(d => d.Status).WithMany(p => p.NotificationLogs)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_NotificationLogs_Status");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Method).HasMaxLength(50);

            entity.HasOne(d => d.Booking).WithMany(p => p.Payments)
                .HasForeignKey(d => d.BookingId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Payments_Booking");

            entity.HasOne(d => d.Status).WithMany(p => p.Payments)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Payments_Status");
        });

        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.Property(e => e.Provider).HasMaxLength(50);
            entity.Property(e => e.TransactionRef).HasMaxLength(150);

            entity.HasOne(d => d.Payment).WithMany(p => p.PaymentTransactions)
                .HasForeignKey(d => d.PaymentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PaymentTransactions_Payment");
        });

        modelBuilder.Entity<Province>(entity =>
        {
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.NameTh).HasMaxLength(100);
        });

        modelBuilder.Entity<Domain.Entities.Queue>(entity =>
        {
            entity.HasIndex(e => e.Guid, "IX_Queues_Guid").IsUnique();

            entity.HasIndex(e => e.ShopId, "IX_Queues_ShopId");

            entity.HasIndex(e => e.StatusId, "IX_Queues_StatusId");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Type).HasMaxLength(20);

            entity.HasOne(d => d.Branch).WithMany(p => p.Queues)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Queues_Branch");

            entity.HasOne(d => d.Shop).WithMany(p => p.Queues)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Queues_Shop");

            entity.HasOne(d => d.Status).WithMany(p => p.Queues)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Queues_Status");
        });

        modelBuilder.Entity<QueueCategory>(entity =>
        {
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Prefix).HasMaxLength(5);

            entity.HasOne(d => d.Shop).WithMany(p => p.QueueCategories)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QC_Shop");
        });

        modelBuilder.Entity<QueueLog>(entity =>
        {
            entity.Property(e => e.Timestamp).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Queue).WithMany(p => p.QueueLogs)
                .HasForeignKey(d => d.QueueId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QueueLogs_Queue");

            entity.HasOne(d => d.Status).WithMany(p => p.QueueLogs)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QueueLogs_Status");
        });

        modelBuilder.Entity<QueueSlot>(entity =>
        {
            entity.HasIndex(e => new { e.BranchId, e.Date, e.StartTime }, "IX_QueueSlots_Branch_Date_StartTime").IsUnique();

            entity.HasIndex(e => e.Guid, "IX_QueueSlots_Guid").IsUnique();

            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Branch).WithMany(p => p.QueueSlots)
                .HasForeignKey(d => d.BranchId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QS_Branch");

            entity.HasOne(d => d.Shop).WithMany(p => p.QueueSlots)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QS_Shop");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Domain.Entities.Service>(entity =>
        {
            entity.HasIndex(e => e.Guid, "IX_Services_Guid").IsUnique();

            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Shop).WithMany(p => p.Services)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Services_Shop");
        });

        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(150);

            entity.HasOne(d => d.Shop).WithMany(p => p.ServiceCategories)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SC_Shop");
        });

        modelBuilder.Entity<ServiceCategoryMap>(entity =>
        {
            entity.HasKey(e => new { e.ServiceId, e.CategoryId });

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Category).WithMany(p => p.ServiceCategoryMaps)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SCM_Category");

            entity.HasOne(d => d.Service).WithMany(p => p.ServiceCategoryMaps)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SCM_Service");
        });

        modelBuilder.Entity<ServiceStaffMap>(entity =>
        {
            entity.HasKey(e => new { e.ServiceId, e.StaffId });

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Service).WithMany(p => p.ServiceStaffMaps)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SSM_Service");

            entity.HasOne(d => d.Staff).WithMany(p => p.ServiceStaffMaps)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SSM_Staff");
        });

        modelBuilder.Entity<Shop>(entity =>
        {
            entity.HasIndex(e => e.Guid, "IX_Shops_Guid").IsUnique();

            entity.HasIndex(e => e.OwnerId, "IX_Shops_OwnerId");

            entity.HasIndex(e => e.TypeId, "IX_Shops_TypeId");

            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).HasMaxLength(150);

            entity.HasOne(d => d.Owner).WithMany(p => p.Shops)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Shops_Owner");

            entity.HasOne(d => d.Status).WithMany(p => p.ShopStatuses)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Shops_Status");

            entity.HasOne(d => d.Type).WithMany(p => p.ShopTypes)
                .HasForeignKey(d => d.TypeId)
                .HasConstraintName("FK_Shops_Type");
        });

        modelBuilder.Entity<ShopBranch>(entity =>
        {
            entity.HasIndex(e => e.Guid, "IX_ShopBranches_Guid").IsUnique();

            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Phone).HasMaxLength(20);

            entity.HasOne(d => d.Address).WithMany(p => p.ShopBranches)
                .HasForeignKey(d => d.AddressId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SB_Address");

            entity.HasOne(d => d.Shop).WithMany(p => p.ShopBranches)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SB_Shop");
        });

        modelBuilder.Entity<ShopBusinessHour>(entity =>
        {
            entity.HasOne(d => d.Shop).WithMany(p => p.ShopBusinessHours)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ShopBusinessHours_Shop");
        });

        modelBuilder.Entity<ShopHoliday>(entity =>
        {
            entity.Property(e => e.Reason).HasMaxLength(200);

            entity.HasOne(d => d.Shop).WithMany(p => p.ShopHolidays)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Holidays_Shop");
        });

        modelBuilder.Entity<ShopSetting>(entity =>
        {
            entity.Property(e => e.Key).HasMaxLength(100);

            entity.HasOne(d => d.Shop).WithMany(p => p.ShopSettings)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ShopSettings_Shop");
        });

        modelBuilder.Entity<ShopStaff>(entity =>
        {
            entity.HasIndex(e => new { e.ShopId, e.UserId }, "IX_ShopStaffs_ShopId_UserId").IsUnique();

            entity.Property(e => e.Role).HasMaxLength(50);

            entity.HasOne(d => d.Shop).WithMany(p => p.ShopStaffs)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SS_Shop");

            entity.HasOne(d => d.User).WithMany(p => p.ShopStaffs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SS_User");
        });

        modelBuilder.Entity<Subdistrict>(entity =>
        {
            entity.Property(e => e.NameEn).HasMaxLength(100);
            entity.Property(e => e.NameTh).HasMaxLength(100);
            entity.Property(e => e.Zipcode).HasMaxLength(10);

            entity.HasOne(d => d.District).WithMany(p => p.Subdistricts)
                .HasForeignKey(d => d.DistrictId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Subdistricts_Districts");
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.PlanName).HasMaxLength(100);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Shop).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.ShopId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Subscriptions_Shop");
        });

        modelBuilder.Entity<SystemConfig>(entity =>
        {
            entity.HasKey(e => e.Key);

            entity.Property(e => e.Key).HasMaxLength(100);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email, "IX_Users_Email");

            entity.HasIndex(e => e.Guid, "IX_Users_Guid").IsUnique();

            entity.HasIndex(e => e.StatusId, "IX_Users_StatusId");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.Phone).HasMaxLength(20);

            entity.HasOne(d => d.Status).WithMany(p => p.Users)
                .HasForeignKey(d => d.StatusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Users_Status");
        });

        modelBuilder.Entity<UserAuthentication>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_UserAuthentications_UserId");

            entity.Property(e => e.PasswordHash).HasMaxLength(500);
            entity.Property(e => e.Provider).HasMaxLength(50);
            entity.Property(e => e.ProviderId).HasMaxLength(150);

            entity.HasOne(d => d.User).WithMany(p => p.UserAuthentications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserAuth_User");
        });

        modelBuilder.Entity<UserImage>(entity =>
        {
            entity.HasIndex(e => new { e.UserId, e.IsPrimary }, "IX_UserImages_UserId_IsPrimary");

            entity.Property(e => e.ContentType).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.FileUrl).HasMaxLength(500);

            entity.HasOne(d => d.User).WithMany(p => p.UserImages)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_UserImages_User");
        });

        modelBuilder.Entity<UserRoleMap>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RoleId });

            entity.HasIndex(e => e.RoleId, "IX_UserRoleMaps_RoleId");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoleMaps)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK_URM_Role");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoleMaps)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_URM_User");
        });

        modelBuilder.Entity<UserSession>(entity =>
        {
            entity.HasIndex(e => e.Guid, "IX_UserSessions_Guid").IsUnique();

            entity.HasIndex(e => e.UserId, "IX_UserSessions_UserId");

            entity.Property(e => e.Guid).HasDefaultValueSql("(newid())");
            entity.Property(e => e.RefreshSalt).HasMaxLength(200);

            entity.HasOne(d => d.User).WithMany(p => p.UserSessions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserSessions_User");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
