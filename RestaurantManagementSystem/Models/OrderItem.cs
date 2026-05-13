using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantManagementSystem.Models
{
    public class OrderItem
    {
        [Key]
        public int OrderItemID { get; set; }

        [Required]
        public int OrderID { get; set; }

        [Required]
        public int MenuItemID { get; set; }

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal OrderItemPrice { get; set; }

        [ForeignKey(nameof(OrderID))]
        public Order Order { get; set; }

        [ForeignKey(nameof(MenuItemID))]
        public MenuItem MenuItem { get; set; }
    }

    public class OrderItemCreateDto
    {
        public int MenuItemID { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderItemReadDto
    {
        public int OrderItemID { get; set; }
        public int Quantity { get; set; }
        public decimal OrderItemPrice { get; set; }

        public string MenuItemName { get; set; }
    }

}
