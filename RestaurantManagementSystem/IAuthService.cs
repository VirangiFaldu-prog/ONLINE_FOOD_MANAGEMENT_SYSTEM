using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem
{
    public interface IAuthService
    {
        Task<object> LoginAsync(string Email, string Password);
        
        string GenerateJwtToken(User user, int restaurantId = 0);
    }
}
