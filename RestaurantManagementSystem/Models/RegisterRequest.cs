using RestaurantManagementSystem.Models.Enums;

namespace RestaurantManagementSystem.Models
{
    public class RegisterRequest
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Phone { get; set; }

        public UserRole Role { get; set; } = UserRole.Customer;
    }
}
