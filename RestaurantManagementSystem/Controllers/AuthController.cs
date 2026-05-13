using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Data;
using RestaurantManagementSystem.Models;
using RestaurantManagementSystem.Models.Enums;

namespace RestaurantManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly RestaurantManagementContext _context;

        public AuthController(IAuthService authService, RestaurantManagementContext context)
        {
            _authService = authService;
            _context = context;
        }

        #region Login
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null)
                return BadRequest("Invalid request");

            var result = await _authService.LoginAsync(request.Email, request.Password);

            if (result == null)
                return Unauthorized("Invalid Email or password");

            return Ok(result);
        }
        #endregion

        #region REGISTER
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email already exists");

            var user = new User
            {
                UserName = request.UserName,
                Email = request.Email,
                Password = request.Password,
                Phone = request.Phone,
                Role = request.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Registration successful");
        }
        #endregion
    }
}
