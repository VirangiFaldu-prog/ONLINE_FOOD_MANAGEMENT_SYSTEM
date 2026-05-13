using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Models.Enums;

namespace RestaurantManagementSystem.Data
{
    public class RestaurantManagementContext : DbContext
    {
        public RestaurantManagementContext(DbContextOptions<RestaurantManagementContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Restaurant> Restaurants { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserID);

                entity.Property(u => u.UserName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(u => u.Email)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.HasIndex(u => u.Email)
                      .IsUnique();

                entity.Property(u => u.Password)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(u => u.Phone)
                      .HasMaxLength(15);

                entity.Property(u => u.Role)
                      .HasConversion<string>() // ENUM → STRING
                      .HasMaxLength(20)
                      .IsRequired();

                entity.Property(u => u.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");
            });





            modelBuilder.Entity<Restaurant>(entity =>
            {
                entity.HasKey(r => r.RestaurantID);

                entity.Property(r => r.OwnerID)
                      .IsRequired();

                entity.Property(r => r.Name)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(r => r.Address)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(r => r.City)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(r => r.IsOpen)
                      .HasDefaultValue(true);

                entity.Property(r => r.Rating)
                      .HasColumnType("decimal(2,1)");

                entity.HasCheckConstraint(
                    "CK_Restaurant_Rating",
                    "Rating BETWEEN 0 AND 5"
                );

                entity.Property(r => r.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.HasOne(r => r.Owner)
                      .WithMany()
                      .HasForeignKey(r => r.OwnerID)
                      .OnDelete(DeleteBehavior.Restrict);
            });




            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(c => c.CategoryID);

                entity.Property(c => c.CategoryName)
                      .IsRequired()
                      .HasMaxLength(50);
            });




            modelBuilder.Entity<MenuItem>(entity =>
            {
                entity.HasKey(m => m.MenuItemID);

                entity.Property(m => m.RestaurantID)
                      .IsRequired();

                entity.Property(m => m.CategoryID)
                      .IsRequired();

                entity.Property(m => m.MenuItemName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(m => m.MenuItemPrice)
                      .HasColumnType("decimal(10,2)")
                      .IsRequired();

                entity.Property(m => m.IsAvailable)
                      .HasDefaultValue(true);

                entity.HasOne(m => m.Restaurant)
                      .WithMany()
                      .HasForeignKey(m => m.RestaurantID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(m => m.Category)
                      .WithMany()
                      .HasForeignKey(m => m.CategoryID)
                      .OnDelete(DeleteBehavior.Restrict);
            });



            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(o => o.OrderID);

                entity.Property(o => o.UserID)
                      .IsRequired();

                entity.Property(o => o.RestaurantID)
                      .IsRequired();

                entity.Property(o => o.OrderStatus)
                      .HasMaxLength(20)
                      .IsRequired();

                entity.Property(o => o.TotalAmount)
                      .HasColumnType("decimal(10,2)")
                      .IsRequired();

                entity.Property(o => o.OrderDate)
                      .HasDefaultValueSql("GETDATE()");

                entity.HasOne(o => o.User)
                      .WithMany()
                      .HasForeignKey(o => o.UserID)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.Restaurant)
                      .WithMany()
                      .HasForeignKey(o => o.RestaurantID)
                      .OnDelete(DeleteBehavior.Restrict);
            });




            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasKey(oi => oi.OrderItemID);

                entity.Property(oi => oi.OrderID)
                      .IsRequired();

                entity.Property(oi => oi.MenuItemID)
                      .IsRequired();

                entity.Property(oi => oi.Quantity)
                      .IsRequired();

                entity.Property(oi => oi.OrderItemPrice)
                      .HasColumnType("decimal(10,2)")
                      .IsRequired();

                entity.HasOne(oi => oi.Order)
                      .WithMany()
                      .HasForeignKey(oi => oi.OrderID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.MenuItem)
                      .WithMany()
                      .HasForeignKey(oi => oi.MenuItemID)
                      .OnDelete(DeleteBehavior.Restrict);
            });




            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(p => p.PaymentID);

                entity.Property(p => p.OrderID)
                      .IsRequired();

                entity.Property(p => p.PaymentMode)
                      .HasMaxLength(20)
                      .IsRequired();

                entity.Property(p => p.PaymentStatus)
                      .HasMaxLength(20)
                      .IsRequired();

                entity.Property(p => p.PaidAmount)
                      .HasColumnType("decimal(10,2)")
                      .IsRequired();

                entity.HasOne(p => p.Order)
                      .WithMany()
                      .HasForeignKey(p => p.OrderID)
                      .OnDelete(DeleteBehavior.Cascade);
            });




            modelBuilder.Entity<Delivery>(entity =>
            {
                entity.HasKey(d => d.DeliveryID);

                entity.Property(d => d.OrderID)
                      .IsRequired();

                entity.Property(d => d.DeliveryUserID)
                      .IsRequired();

                entity.Property(d => d.DeliveryStatus)
                      .HasMaxLength(20)
                      .IsRequired();

                entity.HasOne(d => d.Order)
                      .WithMany()
                      .HasForeignKey(d => d.OrderID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.DeliveryUser)
                      .WithMany()
                      .HasForeignKey(d => d.DeliveryUserID)
                      .OnDelete(DeleteBehavior.Restrict);
            });




            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(r => r.ReviewID);

                entity.Property(r => r.UserID)
                      .IsRequired();

                entity.Property(r => r.RestaurantID)
                      .IsRequired();

                entity.Property(r => r.Rating)
                      .IsRequired();

                entity.Property(r => r.Comment)
                      .HasMaxLength(500);

                entity.Property(r => r.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.HasIndex(r => new { r.UserID, r.RestaurantID })
                      .IsUnique();

                entity.HasOne(r => r.User)
                      .WithMany()
                      .HasForeignKey(r => r.UserID)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Restaurant)
                      .WithMany()
                      .HasForeignKey(r => r.RestaurantID)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }   
}
