using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantManagementSystem.Models
{
    public class MenuItem
    {
        [Key]
        public int MenuItemID { get; set; }

        [Required]
        public int RestaurantID { get; set; }

        [Required]
        public int CategoryID { get; set; }

        [Required, MaxLength(100)]
        public string MenuItemName { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal MenuItemPrice { get; set; }


        public bool IsAvailable { get; set; } = true;

        [MaxLength(300)]
        public string? ImageUrl { get; set; }


        [ForeignKey(nameof(RestaurantID))]
        public Restaurant Restaurant { get; set; }

        [ForeignKey(nameof(CategoryID))]
        public Category Category { get; set; }
    }

    public class MenuItemCreateDto
    {
        public int RestaurantID { get; set; }
        public int CategoryID { get; set; }
        public string MenuItemName { get; set; }
        public decimal MenuItemPrice { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class MenuItemReadDto
    {
        public int MenuItemID { get; set; }
        public string MenuItemName { get; set; }
        public decimal MenuItemPrice { get; set; }
        public bool IsAvailable { get; set; }
        public int RestaurantID { get; set; }

        public string RestaurantName { get; set; }
        public string CategoryName { get; set; }
        public string? ImageUrl { get; set; }
    }

}
