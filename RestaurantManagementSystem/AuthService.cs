using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestaurantManagementSystem.Data;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Models.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace RestaurantManagementSystem
{
    public class AuthService : IAuthService
    {
        private readonly RestaurantManagementContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(RestaurantManagementContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        
        public string GenerateJwtToken(User user, int restaurantId = 0)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
    {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("UserID", user.UserID.ToString()),
                new Claim("RestaurantID", restaurantId.ToString())
    };
            // Token expiry time
            var expiryMinutes = Convert.ToDouble(jwtSettings["TokenExpiryMinutes"]);

            // Create token
            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        
        public async Task<object> LoginAsync(string Email, string password)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == Email && u.Password == password);

            if (user == null)
                return null;

            int restaurantId = 0;

            if (user.Role == UserRole.Restaurant)
            {
                var restaurant = await _context.Restaurants
                    .FirstOrDefaultAsync(r => r.OwnerID == user.UserID);

                if (restaurant != null)
                    restaurantId = restaurant.RestaurantID;
            }

            var token = GenerateJwtToken(user, restaurantId);

            return new
            {
                token,
                user = new
                {
                    user.UserID,
                    user.UserName,
                    user.Email,
                    user.Role
                }
            };
        }

    }
}
