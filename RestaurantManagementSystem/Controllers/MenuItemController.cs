using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Data;
using RestaurantManagementSystem.Models;
using System.Security.Claims;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuItemController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;

        public MenuItemController(RestaurantManagementContext context)
        {
            _context = context;
        }

        #region Helper Methods

        private int GetUserId()
        {
            return int.TryParse(User.FindFirst("UserID")?.Value, out var userId)
                ? userId
                : 0;
        }

        private string? GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value;
        }

        #endregion

        #region GetAllMenuItems

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllMenuItems()
        {
            var role = GetUserRole();

            var query = _context.MenuItems
                .Include(m => m.Restaurant)
                .Include(m => m.Category)
                .AsQueryable();

            if (role != "Admin")
                query = query.Where(m => m.IsAvailable);

            var items = await query
                .Select(m => new MenuItemReadDto
                {
                    MenuItemID = m.MenuItemID,
                    MenuItemName = m.MenuItemName,
                    MenuItemPrice = m.MenuItemPrice,
                    IsAvailable = m.IsAvailable,
                    RestaurantID = m.RestaurantID,
                    RestaurantName = m.Restaurant.Name,
                    CategoryName = m.Category.CategoryName,
                    ImageUrl = m.ImageUrl
                })
                .ToListAsync();

            return Ok(items);
        }
        #endregion

        #region GetMenuItemsByRestaurant
        [Authorize]
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetMenuItemsByRestaurant(int restaurantId)
        {
            var userId = GetUserId();
            var role = GetUserRole();

            if (role == "Restaurant")
            {
                var restaurant = await _context.Restaurants
                    .FirstOrDefaultAsync(r => r.RestaurantID == restaurantId && r.OwnerID == userId);

                if (restaurant == null)
                    return StatusCode(403, "You cannot access this restaurant");
            }

            var items = await _context.MenuItems
                .Where(m => m.RestaurantID == restaurantId)
                .Include(m => m.Restaurant)
                .Include(m => m.Category)
                .Select(m => new MenuItemReadDto
                {
                    MenuItemID = m.MenuItemID,
                    MenuItemName = m.MenuItemName,
                    MenuItemPrice = m.MenuItemPrice,
                    IsAvailable = m.IsAvailable,
                    RestaurantID = m.RestaurantID,
                    RestaurantName = m.Restaurant.Name,
                    CategoryName = m.Category.CategoryName,
                    ImageUrl = m.ImageUrl
                })
                .ToListAsync();

            return Ok(items);
        }
        #endregion

        #region GetMenuItemById
        [Authorize]
        [HttpGet("{menuItemId}")]
        public async Task<IActionResult> GetMenuItemById(int menuItemId)
        {
            var item = await _context.MenuItems
                .Include(m => m.Restaurant)
                .Include(m => m.Category)
                .FirstOrDefaultAsync(m => m.MenuItemID == menuItemId);

            if (item == null)
                return NotFound("Menu item not found");

            var role = GetUserRole();
            var userId = GetUserId();

            if (role == "Restaurant" && item.Restaurant.OwnerID != userId)
                return Forbid();

            var itemDto = new MenuItemReadDto
            {
                MenuItemID = item.MenuItemID,
                MenuItemName = item.MenuItemName,
                MenuItemPrice = item.MenuItemPrice,
                IsAvailable = item.IsAvailable,
                RestaurantID = item.RestaurantID,
                RestaurantName = item.Restaurant.Name,
                CategoryName = item.Category.CategoryName,
                ImageUrl = item.ImageUrl
            };

            return Ok(itemDto);
        }

        #endregion

        #region Create

        [Authorize(Roles = "Restaurant")]
        [HttpPost]
        public async Task<IActionResult> CreateMenuItem([FromBody] MenuItemCreateDto dto)
        {
            if (dto.RestaurantID <= 0)
                return BadRequest("RestaurantID is required");

            var userId = GetUserId();
            
            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.RestaurantID == dto.RestaurantID && r.OwnerID == userId);

            if (restaurant == null)
                return StatusCode(403, "You cannot add menu items to this restaurant");

            var menuItem = new MenuItem
            {
                RestaurantID = dto.RestaurantID,
                CategoryID = dto.CategoryID,
                MenuItemName = dto.MenuItemName,
                MenuItemPrice = dto.MenuItemPrice,
                ImageUrl = dto.ImageUrl,
                IsAvailable = true
            };

            _context.MenuItems.Add(menuItem);
            await _context.SaveChangesAsync();

            return Ok(menuItem);
        }

        #endregion

        #region Update

        [Authorize(Roles = "Restaurant")]
        [HttpPut("{menuItemId}")]
        public async Task<IActionResult> UpdateMenuItem(int menuItemId, [FromBody] MenuItemCreateDto dto)
        {
            var menuItem = await _context.MenuItems.FindAsync(menuItemId);

            if (menuItem == null)
                return NotFound("Menu item not found");

            var userId = GetUserId();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.RestaurantID == menuItem.RestaurantID && r.OwnerID == userId);

            if (restaurant == null)
               
                return StatusCode(403, "You can only update your restaurant items");

            menuItem.CategoryID = dto.CategoryID;
            menuItem.MenuItemName = dto.MenuItemName;
            menuItem.MenuItemPrice = dto.MenuItemPrice;
            menuItem.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();

            return Ok(menuItem);
        }

        #endregion

        #region Availability

        [Authorize(Roles = "Restaurant,Admin")]
        [HttpPatch("{menuItemId}/availability")]
        public async Task<IActionResult> ChangeAvailability(int menuItemId, [FromQuery] bool isAvailable)
        {
            var menuItem = await _context.MenuItems.FindAsync(menuItemId);

            if (menuItem == null)
                return NotFound("Menu item not found");

            var userId = GetUserId();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.RestaurantID == menuItem.RestaurantID && r.OwnerID == userId);

            if (GetUserRole() != "Admin" && restaurant == null)
                return StatusCode(403, "You cannot modify this restaurant");



            menuItem.IsAvailable = isAvailable;

            await _context.SaveChangesAsync();

            return Ok(isAvailable ? "Menu item available" : "Menu item unavailable");
        }

        #endregion

        #region Delete

        [Authorize(Roles = "Restaurant,Admin")]
        [HttpDelete("{menuItemId}")]
        public async Task<IActionResult> DeleteMenuItem(int menuItemId)
        {
            var menuItem = await _context.MenuItems.FindAsync(menuItemId);

            if (menuItem == null)
                return NotFound("Menu item not found");

            var userId = GetUserId();

            var restaurant = await _context.Restaurants
                .FirstOrDefaultAsync(r => r.RestaurantID == menuItem.RestaurantID && r.OwnerID == userId);

            if (GetUserRole() != "Admin" && restaurant == null)
                return StatusCode(403, "You cannot delete this item");

            // Soft delete instead of removing
            menuItem.IsAvailable = false;

            await _context.SaveChangesAsync();

            return Ok("Menu item disabled successfully");
        }

        #endregion
    }
}


