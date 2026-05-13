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
    public class CategoryController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;

        public CategoryController(RestaurantManagementContext context)
        {
            _context = context;
        }

        #region Helper Methods
       
            private int GetRoleId() =>
                int.Parse(User.FindFirst("RoleID")?.Value ?? "0");

        private bool IsAdmin() => User.IsInRole("Admin");
        private bool IsRestaurant() => User.IsInRole("Restaurant");
        #endregion

        #region Get
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories
                .Select(c => new
                {
                    c.CategoryID,
                    c.CategoryName
                })
                .ToListAsync();

            return Ok(categories);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            if (!IsAdmin() && !IsRestaurant())
                return Forbid("Access denied");

            var category = await _context.Categories
                .Where(c => c.CategoryID == id)
                .Select(c => new
                {
                    c.CategoryID,
                    c.CategoryName
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound("Category not found");

            return Ok(category);
        }
        #endregion

        #region Create
        [Authorize(Roles = "Admin,Restaurant")]
        [HttpPost]
        public async Task<IActionResult> CreateCategory(CategoryCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CategoryName))
                return BadRequest("Category name is required");

            var exists = await _context.Categories
                .AnyAsync(c => c.CategoryName.ToLower() == dto.CategoryName.Trim().ToLower());

            if (exists)
                return BadRequest("Category already exists");

            var category = new Category
            {
                CategoryName = dto.CategoryName.Trim()
            };

            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();

            return Ok("Category created successfully");
        }
        #endregion

        #region Update
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, CategoryCreateDto dto)
        {
            if (!IsRestaurant() && !IsAdmin())
                return Forbid("Only restaurant users and admins can update categories");

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound("Category not found");

            var exists = await _context.Categories
                .AnyAsync(c =>
                    c.CategoryName.ToLower() == dto.CategoryName.Trim().ToLower()
                    && c.CategoryID != id);

            if (exists)
                return BadRequest("Another category with the same name already exists");

            category.CategoryName = dto.CategoryName.Trim();
            await _context.SaveChangesAsync();

            return Ok("Category updated successfully");
        }
        #endregion

        #region Delete
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            if (!IsRestaurant() && !IsAdmin())
                return Forbid("Only restaurant users and admins can delete categories");

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound("Category not found");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return Ok("Category deleted successfully");
        }
        #endregion
    }
}

