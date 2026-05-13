
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace RestaurantManagementSystem.Models
{
    public class Order
    {
        [Key]
        public int OrderID { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        public int RestaurantID { get; set; }

        [MaxLength(20)]
        public string OrderStatus { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(500)]
        public string? DeliveryAddress { get; set; }  // ← add

        [MaxLength(20)]
        public string? Phone { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.Now;

        [ForeignKey(nameof(UserID))]
        public User User { get; set; }

        [ForeignKey(nameof(RestaurantID))]
        public Restaurant Restaurant { get; set; }
    }

    public class OrderCreateDto
    {
        public int RestaurantID { get; set; }
        
        public List<OrderItemCreateDto> Items { get; set; }

        public string? DeliveryAddress { get; set; }  // ← ADD
        public string? Phone { get; set; }
    }

    public class OrderReadDto
    {
        public int OrderID { get; set; }
        public string OrderStatus { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }

        public string UserName { get; set; }
        public string RestaurantName { get; set; }

        public string? DeliveryAddress { get; set; }  // ← ADD
        public string? Phone { get; set; }
    }
}
