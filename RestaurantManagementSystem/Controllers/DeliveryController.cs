using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Data;
using RestaurantManagementSystem.Models;
using System.Data;
using System.Security.Claims;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeliveryController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;

        public DeliveryController(RestaurantManagementContext context)
        {
            _context = context;
        }

        #region Helper Methods

        private int GetUserId()
        {
            return int.TryParse(User.FindFirst("UserID")?.Value, out var id) ? id : 0;
        }

        private string GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        }

        private async Task<List<int>> GetOwnedRestaurantIds(int ownerId)
        {
            return await _context.Restaurants
                .Where(r => r.OwnerID == ownerId)
                .Select(r => r.RestaurantID)
                .ToListAsync();
        }

        #endregion

        #region GetAllDeliveries
        [Authorize(Roles = "Delivery,Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllDeliveries()
        {
            int userId = GetUserId();
            string role = GetUserRole();

            IQueryable<Delivery> query = _context.Deliveries
                .Include(d => d.Order)
                    .ThenInclude(o => o.User)
                .Include(d => d.Order)
                    .ThenInclude(o => o.Restaurant)
                .Include(d => d.DeliveryUser);

            if (role == "Delivery")
            {
                query = query.Where(d => d.DeliveryUserID == userId);
            }

            var deliveries = await query
                .OrderByDescending(d => d.DeliveryID)
                .Select(d => new DeliveryReadDto
                {
                    DeliveryID = d.DeliveryID,
                    DeliveryStatus = d.DeliveryStatus,
                    OrderID = d.OrderID,
                    DeliveryUserID = d.DeliveryUserID,
                    DeliveryUserName = d.DeliveryUser.UserName,
                    Order = d.Order == null ? null : new OrderSummaryDto
                    {
                        OrderID = d.Order.OrderID,
                        TotalAmount = d.Order.TotalAmount,
                        OrderDate = d.Order.OrderDate,
                        UserName = d.Order.User != null ? d.Order.User.UserName : null,
                        RestaurantName = d.Order.Restaurant != null ? d.Order.Restaurant.Name : null,
                        DeliveryAddress = d.Order.DeliveryAddress,  // ? ADD
                        Phone = d.Order.Phone,
                    },

                })
                .ToListAsync();

            return Ok(deliveries);
        }
        #endregion

        #region GetDeliveryById
        [Authorize(Roles = "Restaurant,Delivery,Admin")]
        [HttpGet("{deliveryId}")]
        public async Task<IActionResult> GetDeliveryById(int deliveryId)
        {
            int userId = GetUserId();
            string role = GetUserRole();

            var delivery = await _context.Deliveries
                .Include(d => d.Order)
                    .ThenInclude(o => o.User)
                .Include(d => d.Order)
                    .ThenInclude(o => o.Restaurant)
                .Include(d => d.DeliveryUser)
                .FirstOrDefaultAsync(d => d.DeliveryID == deliveryId);

            if (delivery == null)
                return NotFound("Delivery not found");

            if (role == "Admin")
                return Ok(delivery); // optional: admin gets raw entity

            if (role == "Delivery" && delivery.DeliveryUserID != userId)
                return Forbid("You can only view your own deliveries");

            if (role == "Restaurant")
            {
                var ownedRestaurants = await GetOwnedRestaurantIds(userId);
                if (!ownedRestaurants.Contains(delivery.Order.RestaurantID))
                    return Forbid("You do not own this restaurant");
            }

            var dto = new DeliveryReadDto
            {
                DeliveryID = delivery.DeliveryID,
                DeliveryStatus = delivery.DeliveryStatus,
                OrderID = delivery.OrderID,
                DeliveryUserID = delivery.DeliveryUserID,
                DeliveryUserName = delivery.DeliveryUser?.UserName,
                Order = delivery.Order == null ? null : new OrderSummaryDto
                {
                    OrderID = delivery.Order.OrderID,
                    TotalAmount = delivery.Order.TotalAmount,
                    OrderDate = delivery.Order.OrderDate,
                    UserName = delivery.Order.User?.UserName,
                    RestaurantName = delivery.Order.Restaurant?.Name,
                    DeliveryAddress = delivery.Order.DeliveryAddress,  // ? ADD
                    Phone = delivery.Order.Phone,
                }
            };

            return Ok(dto);
        }
        #endregion

        #region GetDeliveriesByDeliveryUser
        [Authorize(Roles = "Restaurant,Delivery,Admin")]
        [HttpGet("delivery-user/{deliveryUserId}")]
        public async Task<IActionResult> GetDeliveriesByDeliveryUser(int deliveryUserId)
        {
            int userId = GetUserId();
            string role = GetUserRole();

            if (role == "Delivery" && deliveryUserId != userId)
                return Forbid("You can only view your own deliveries");

            IQueryable<Delivery> query = _context.Deliveries
    .Where(d => d.DeliveryUserID == deliveryUserId)

                .Include(d => d.Order)
                    .ThenInclude(o => o.User)
                .Include(d => d.Order)
                    .ThenInclude(o => o.Restaurant)
                .Include(d => d.DeliveryUser);

            if (role == "Restaurant")
            {
                var ownedRestaurants = await GetOwnedRestaurantIds(userId);
                query = query.Where(d => ownedRestaurants.Contains(d.Order.RestaurantID));

            }

            var deliveries = await query
                .OrderByDescending(d => d.DeliveryID)
                .Select(d => new DeliveryReadDto
                {
                    DeliveryID = d.DeliveryID,
                    DeliveryStatus = d.DeliveryStatus,
                    OrderID = d.OrderID,
                    DeliveryUserID = d.DeliveryUserID,
                    DeliveryUserName = d.DeliveryUser.UserName,
                    Order = d.Order == null ? null : new OrderSummaryDto
                    {
                        OrderID = d.Order.OrderID,
                        TotalAmount = d.Order.TotalAmount,
                        OrderDate = d.Order.OrderDate,
                        UserName = d.Order.User != null ? d.Order.User.UserName : null,
                        RestaurantName = d.Order.Restaurant != null ? d.Order.Restaurant.Name : null,
                        DeliveryAddress = d.Order.DeliveryAddress,  // ? ADD
                        Phone = d.Order.Phone
                    }
                })
                .ToListAsync();

            return Ok(deliveries);
        }
        #endregion

        #region AssignDelivery
        [Authorize(Roles = "Restaurant,Admin")]
        [HttpPost("{orderId}/assign/{deliveryUserId}")]
        public async Task<IActionResult> AssignDelivery(int orderId, int deliveryUserId)
        {
            int userId = GetUserId();
            string role = GetUserRole();

            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound("Order not found");

            // Restaurant ownership check
            if (role == "Restaurant")
            {
                var ownedRestaurants = await GetOwnedRestaurantIds(userId);

                if (!ownedRestaurants.Contains(order.RestaurantID))
                    return Forbid("You do not own this restaurant");
            }

            // Verify delivery user exists and is Delivery role
            var deliveryUser = await _context.Users
                .FirstOrDefaultAsync(u => u.UserID == deliveryUserId && u.Role == Models.Enums.UserRole.Delivery);

            if (deliveryUser == null)
                return NotFound("Delivery user not found");

            // Check if delivery already assigned
            if (await _context.Deliveries.AnyAsync(d => d.OrderID == orderId))
                return BadRequest("Delivery already assigned");

            var delivery = new Delivery
            {
                OrderID = orderId,
                DeliveryUserID = deliveryUserId,
                DeliveryStatus = "Assigned"
            };

            _context.Deliveries.Add(delivery);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Delivery assigned successfully",
                OrderID = orderId,
                DeliveryUserID = deliveryUserId
            });
        }
        #endregion

        #region UpdateDeliveryStatus
        [HttpPatch("{deliveryId}/status")]
        public async Task<IActionResult> UpdateDeliveryStatus(int deliveryId, [FromQuery] string status)
        {
            int userId = GetUserId();
            string role = GetUserRole();

            var delivery = await _context.Deliveries
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.DeliveryID == deliveryId);

            if (delivery == null)
                return NotFound("Delivery not found");

            if (role == "Delivery" && delivery.DeliveryUserID != userId)
                return Forbid("You can only update your own deliveries");

            if (role == "Restaurant")
            {
                var ownedRestaurants = await GetOwnedRestaurantIds(userId);
                if (!ownedRestaurants.Contains(delivery.Order.RestaurantID))
                    return Forbid("You do not own this restaurant");
            }

            delivery.DeliveryStatus = status;

            // Update order status when delivery is marked as delivered
            if (status == "Delivered")
            {
                delivery.Order.OrderStatus = "Delivered";
            }

            await _context.SaveChangesAsync();

            return Ok("Delivery status updated successfully");
        }
        #endregion

        #region CancelDelivery
        [Authorize(Roles = "Restaurant")]
        [HttpDelete("{deliveryId}")]
        public async Task<IActionResult> CancelDelivery(int deliveryId)
        {
            int ownerId = GetUserId();

            var delivery = await _context.Deliveries
                .Include(d => d.Order)
                .FirstOrDefaultAsync(d => d.DeliveryID == deliveryId);

            if (delivery == null)
                return NotFound("Delivery not found");

            var ownedRestaurants = await GetOwnedRestaurantIds(ownerId);
            if (!ownedRestaurants.Contains(delivery.Order.RestaurantID))
                return Forbid("You do not own this restaurant");

            _context.Deliveries.Remove(delivery);
            await _context.SaveChangesAsync();

            return Ok("Delivery cancelled successfully");
        }
        #endregion
    }
}


