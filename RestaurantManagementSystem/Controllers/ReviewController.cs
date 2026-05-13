using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Data;
using RestaurantManagementSystem.Models;
using System.Security.Claims;

namespace RestaurantManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;

        public ReviewController(RestaurantManagementContext context)
        {
            _context = context;
        }

        #region Helper Methods
        private int GetUserId() =>
            int.Parse(User.FindFirst("UserID")?.Value ?? "0");

        private string GetUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value;
        #endregion

        #region GetAllReviews
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Restaurant)
                .Select(r => new
                {
                    r.ReviewID,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    UserName = r.User.UserName,
                    RestaurantID = r.RestaurantID,
                    RestaurantName = r.Restaurant.Name
                })
                .ToListAsync();

            return Ok(reviews);
        }
        #endregion

        #region GetReviewsByRestaurant
        [Authorize]
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetReviewsByRestaurant(int restaurantId)
        {
            if (!await _context.Restaurants.AnyAsync(r => r.RestaurantID == restaurantId))
                return NotFound("Restaurant not found");

            var reviews = await _context.Reviews
                .Where(r => r.RestaurantID == restaurantId)
                .Select(r => new
                {
                    r.ReviewID,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    UserName = r.User.UserName,
                })
                .ToListAsync();

            return Ok(reviews);
        }
        #endregion

        #region GetMyReviews
        [Authorize]
        [HttpGet("my-reviews")]
        public async Task<IActionResult> GetMyReviews()
        {
            int userId = GetUserId();
            if (userId == 0)
                return Unauthorized("Invalid token");

            var reviews = await _context.Reviews
                .Where(r => r.UserID == userId)
                .Include(r => r.Restaurant)
                .Select(r => new
                {
                    r.ReviewID,
                    r.Rating,
                    r.Comment,
                    r.CreatedAt,
                    RestaurantID = r.RestaurantID,
                    RestaurantName = r.Restaurant.Name
                })
                .ToListAsync();

            return Ok(reviews);
        }
        #endregion

        #region CreateReview
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] ReviewCreateDto dto)
        {
            int userId = GetUserId();
            if (userId == 0)
                return Unauthorized("Invalid token");

            if (!await _context.Restaurants.AnyAsync(r => r.RestaurantID == dto.RestaurantID))
                return NotFound("Restaurant not found");

            bool alreadyReviewed = await _context.Reviews
                .AnyAsync(r => r.UserID == userId && r.RestaurantID == dto.RestaurantID);

            if (alreadyReviewed)
                return BadRequest("You have already reviewed this restaurant");

            var review = new Review
            {
                UserID = userId,
                RestaurantID = dto.RestaurantID,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Review added successfully",
                ReviewID = review.ReviewID
            });
        }
        #endregion

        #region UpdateReview
        [Authorize(Roles = "Customer")]
        [HttpPut("{reviewId}")]
        public async Task<IActionResult> UpdateReview(int reviewId, [FromBody] ReviewCreateDto dto)
        {
            int userId = GetUserId();
            if (userId == 0)
                return Unauthorized("Invalid token");

            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
                return NotFound("Review not found");

            if (review.UserID != userId)
                return Forbid("You can update only your own review");

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;

            await _context.SaveChangesAsync();

            return Ok("Review updated successfully");
        }
        #endregion

        #region DeleteReview
        [Authorize(Roles = "Customer,Admin")]
        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReview(int reviewId)
        {
            int userId = GetUserId();
            if (userId == 0)
                return Unauthorized("Invalid token");

            bool isAdmin = GetUserRole() == "Admin";

            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null)
                return NotFound("Review not found");

            if (!isAdmin && review.UserID != userId)
                return Forbid("You can delete only your own review");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok("Review deleted successfully");
        }
        #endregion
    }
}


