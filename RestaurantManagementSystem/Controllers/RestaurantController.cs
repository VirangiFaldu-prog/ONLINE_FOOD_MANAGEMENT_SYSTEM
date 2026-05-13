using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Data;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Models.Enums;
using System.Security.Claims;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;

        public RestaurantController(RestaurantManagementContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst("UserID")?.Value ?? "0");

        private string GetUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value;

        #region GetAllRestaurants
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllRestaurants()
        {
            var role = GetUserRole();
            var userId = GetUserId();

            IQueryable<Restaurant> query = _context.Restaurants
                .Include(r => r.Owner)
                .AsNoTracking();

            if (role == "Restaurant")
                query = query.Where(r => r.OwnerID == userId);

            var restaurants = await query.Select(r => new RestaurantReadDto
            {
                RestaurantID = r.RestaurantID,
                Name = r.Name,
                City = r.City,
                Rating = r.Rating,
                IsOpen = r.IsOpen,
                ImageUrl = r.ImageUrl,
                UserName = r.Owner.UserName
            }).ToListAsync();

            return Ok(restaurants);
        }
        #endregion

        #region GetRestaurantById
        [Authorize(Roles = "Restaurant,Admin,Customer,Delivery")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRestaurantById(int id)
        {
            var role = GetUserRole();
            var userId = GetUserId();

            var restaurant = await _context.Restaurants
                .Include(r => r.Owner)
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.RestaurantID == id);

            if (restaurant == null)
                return NotFound("Restaurant not found");

            if (role == "Restaurant" && restaurant.OwnerID != userId)
                return Forbid();

            return Ok(new RestaurantReadDto
            {
                RestaurantID = restaurant.RestaurantID,
                Name = restaurant.Name,
                City = restaurant.City,
                Rating = restaurant.Rating,
                IsOpen = restaurant.IsOpen,
                ImageUrl = restaurant.ImageUrl,
                UserName = restaurant.Owner.UserName
            });
        }
        #endregion

        #region CreateRestaurant
        [Authorize(Roles = "Restaurant")]
        [HttpPost]
        public async Task<IActionResult> CreateRestaurant(RestaurantCreateDto dto)
        {
            var userId = GetUserId();

            var owner = await _context.Users
                .FirstOrDefaultAsync(u => u.UserID == userId && u.Role == UserRole.Restaurant);

            if (owner == null)
                return Unauthorized("Invalid restaurant owner");

            var restaurant = new Restaurant
            {
                OwnerID = userId,
                Name = dto.Name,
                Address = dto.Address,
                City = dto.City,
                IsOpen = dto.IsOpen,
                ImageUrl = dto.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRestaurantById),
                new { id = restaurant.RestaurantID }, restaurant);
        }
        #endregion

        #region UpdateRestaurant
        [Authorize(Roles = "Restaurant,Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRestaurant(int id, RestaurantCreateDto dto)
        {
            var role = GetUserRole();
            var userId = GetUserId();

            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
                return NotFound();

            if (role == "Restaurant" && restaurant.OwnerID != userId)
                return Forbid();

            restaurant.Name = dto.Name;
            restaurant.Address = dto.Address;
            restaurant.City = dto.City;
            restaurant.IsOpen = dto.IsOpen;
            restaurant.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();

            return Ok("Restaurant updated successfully");
        }
        #endregion

        #region ChangeRestaurantStatus
        [Authorize(Roles = "Restaurant,Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> ChangeRestaurantStatus(int id, [FromQuery] bool isOpen)
        {
            var userId = GetUserId();

            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
                return NotFound();

            if (restaurant.OwnerID != userId && !User.IsInRole("Admin"))
                return Forbid();

            restaurant.IsOpen = isOpen;

            var menuItems = await _context.MenuItems
                .Where(m => m.RestaurantID == id)
                .ToListAsync();

            foreach (var item in menuItems)
                item.IsAvailable = isOpen;

            await _context.SaveChangesAsync();

            return Ok(new { restaurant.RestaurantID, restaurant.IsOpen });
        }
        #endregion

        #region DeleteRestaurant
        [Authorize(Roles = "Restaurant,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRestaurant(int id)
        {
            var role = GetUserRole();
            var userId = GetUserId();

            var restaurant = await _context.Restaurants.FindAsync(id);

            if (restaurant == null)
                return NotFound();

            if (role == "Restaurant" && restaurant.OwnerID != userId)
                return Forbid();

            // Soft-delete all menu items
            var menuItems = await _context.MenuItems
                .Where(m => m.RestaurantID == id)
                .ToListAsync();

            foreach (var item in menuItems)
                item.IsAvailable = false;

            restaurant.IsOpen = false;
            await _context.SaveChangesAsync();

            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        #endregion
    }
}