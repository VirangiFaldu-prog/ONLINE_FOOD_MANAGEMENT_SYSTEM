using System.ComponentModel.DataAnnotations;

namespace RestaurantManagementSystem.Models
{
    public class Category
    {
        [Key]
        public int CategoryID { get; set; }

        [Required, MaxLength(50)]
        public string CategoryName { get; set; }
        
    }

    public class CategoryCreateDto
    {
        public string CategoryName { get; set; }

        //public string RestaurantName { get; set; }
    }
}
