using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantManagementSystem.Models
{
    public class Payment
    {
        [Key]
        public int PaymentID { get; set; }

        [Required]
        public int OrderID { get; set; }

        [MaxLength(20)]
        public string PaymentMode { get; set; }

        [MaxLength(20)]
        public string PaymentStatus { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal PaidAmount { get; set; }


        [ForeignKey(nameof(OrderID))]
        public Order Order { get; set; }

    }

    public class PaymentCreateDto
    {
        public int OrderID { get; set; }
        public string PaymentMode { get; set; }
        public decimal PaidAmount { get; set; }
    }
}
