using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantManagementSystem.Models
{
    public class Review
    {
        [Key]
        public int ReviewID { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        public int RestaurantID { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(500)]
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;


        [ForeignKey(nameof(UserID))]
        public User User { get; set; }

        [ForeignKey(nameof(RestaurantID))]
        public Restaurant Restaurant { get; set; }
    }

    public class ReviewCreateDto
    {
        public int RestaurantID { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
    }

    public class ReviewReadDto
    {
        public int ReviewID { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }

        public string UserName { get; set; }
        public string RestaurantName { get; set; }
    }

}
