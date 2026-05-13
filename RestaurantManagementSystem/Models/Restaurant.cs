using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantManagementSystem.Models
{
    public class Restaurant
    {
        [Key]
        public int RestaurantID { get; set; }

        [Required]
        public int OwnerID { get; set; }
        //here ownerID==UserID

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required, MaxLength(200)]
        public string Address { get; set; }

        [Required, MaxLength(50)]
        public string City { get; set; }

        public bool IsOpen { get; set; } = true;

        [Column(TypeName = "decimal(2,1)")]
        public decimal? Rating { get; set; }

        [MaxLength(300)]
        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;


        [ForeignKey(nameof(OwnerID))]
        public User Owner { get; set; }
    }

    public class RestaurantCreateDto
    {

        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public bool IsOpen { get; set; } = true;

        public string? ImageUrl { get; set; }
    }

    public class RestaurantReadDto
    {
        public int RestaurantID { get; set; }

        public int OwnerID { get; set; }
        public string Name { get; set; }
        public string City { get; set; }
        public decimal? Rating { get; set; }
        public bool IsOpen { get; set; }
        public string UserName { get; set; }
        public string? ImageUrl { get; set; }


    }
}
