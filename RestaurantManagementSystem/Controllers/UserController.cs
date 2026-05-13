using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Data;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Models.Enums;
using System.Security.Claims;

namespace RestaurantManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;
        public UserController(RestaurantManagementContext context)
        {
            _context = context;
        }

        #region Helper Methods
        private int GetUserId() =>
            int.Parse(User.FindFirst("UserID")?.Value ?? "0");

        private string GetUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value;

        #endregion

        #region GetUser
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var role = GetUserRole();
            var userId = GetUserId();

            IQueryable<User> query = _context.Users;

            // 🔒 Non-admin can see only themselves
            if (role != "Admin")
                query = query.Where(u => u.UserID == userId);

            var users = await query
                .Select(u => new UserReadDto
                {
                    UserID = u.UserID,
                    UserName = u.UserName,
                    Email = u.Email,
                    Role = u.Role,
                    Phone = u.Phone,
                })
                .ToListAsync();

            return Ok(users);
        }
        #endregion

        #region GetUserById
        [Authorize]
        [HttpGet("{id}")]

        public async Task<IActionResult> GetUserById(int id)
        {
            var role = GetUserRole();
            var userId = GetUserId();

            // 🔒 Only admin OR owner
            if (role != "Admin" && userId != id)
                return Forbid("You can view only your own profile");

            var user = await _context.Users
                .Where(u => u.UserID == id)
                .Select(u => new UserReadDto
                {
                    UserID = u.UserID,
                    UserName = u.UserName,
                    Email = u.Email,
                    Role = u.Role,
                    Phone = u.Phone,
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }
        #endregion

        #region GetUsersByRole
        [Authorize(Roles = "Restaurant,Admin")]
        [HttpGet("role/{role}")]
        public async Task<IActionResult> GetUsersByRole(UserRole role)
        {
            var users = await _context.Users
                .Where(u => u.Role == role)
                .Select(u => new
                {
                    u.UserID,
                    u.UserName,
                    u.Email,
                    u.Phone
                })
                .ToListAsync();

            return Ok(users);
        }
        #endregion

        #region UpdateUser
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserCreateDto dto)
        {
            var role = GetUserRole();
            var userId = GetUserId();

            
            if (role != "Admin" && userId != id)
                return Forbid("You can update only your own profile");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.UserID != id))
                return BadRequest("Email already exists");

            user.UserName = dto.UserName;
            user.Email = dto.Email;
            user.Password = dto.Password;
            user.Phone = dto.Phone;

            await _context.SaveChangesAsync();
            return Ok("User updated successfully");
        }
        #endregion

        #region DeleteUser
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        #endregion
  
    }
}