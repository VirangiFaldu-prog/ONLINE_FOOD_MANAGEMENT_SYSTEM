using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantManagementSystem.Models
{
    public class Delivery
    {
        [Key]
        public int DeliveryID { get; set; }

        [Required]
        public int OrderID { get; set; }

        [Required]
        public int DeliveryUserID { get; set; }

        [MaxLength(20)]
        public string DeliveryStatus { get; set; }


        [ForeignKey(nameof(OrderID))]
        public Order Order { get; set; }

        [ForeignKey(nameof(DeliveryUserID))]
        public User DeliveryUser { get; set; }
    }

    public class DeliveryUpdateDto
    {
        public string DeliveryStatus { get; set; }
    }

    public class OrderSummaryDto
    {
        public int OrderID { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime? OrderDate { get; set; }
        public string? UserName { get; set; }
        public string? RestaurantName { get; set; }
        public string? DeliveryAddress { get; set; }  
        public string? Phone { get; set; }

    }

    public class DeliveryReadDto
    {
        public int DeliveryID { get; set; }
        public string? DeliveryStatus { get; set; }
        public int OrderID { get; set; }
        public OrderSummaryDto? Order { get; set; }
        public int DeliveryUserID { get; set; }
        public string? DeliveryUserName { get; set; }
    }
}
