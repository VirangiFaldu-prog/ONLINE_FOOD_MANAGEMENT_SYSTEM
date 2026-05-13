using RestaurantManagementSystem.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace RestaurantManagementSystem.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required, MaxLength(100)]
        public string UserName { get; set; }

        [Required, MaxLength(100)]
        public string Email { get; set; }

        [Required, MaxLength(200)]
        public string Password { get; set; }

        [MaxLength(15)]
        public string? Phone { get; set; }

        [Required]
        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        
    }

    public class UserCreateDto
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? Phone { get; set; }
        public UserRole Role { get; set; }
    }

    public class UserReadDto
    {
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public string? Phone { get; set; }
        
       
    }

}
