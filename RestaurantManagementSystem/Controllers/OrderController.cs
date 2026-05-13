using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Data;
using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;

        public OrderController(RestaurantManagementContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst("UserID")?.Value ?? "0");

        private bool IsAdmin() => User.IsInRole("Admin");
        private bool IsRestaurant() => User.IsInRole("Restaurant");
        private bool IsCustomer() => User.IsInRole("Customer");

        #region GetAllOrders
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Restaurant)
                .AsNoTracking()
                .Select(o => new OrderReadDto
                {
                    OrderID = o.OrderID,
                    OrderStatus = o.OrderStatus,
                    TotalAmount = o.TotalAmount,
                    OrderDate = o.OrderDate,
                    UserName = o.User.UserName,
                    RestaurantName = o.Restaurant.Name,
                    DeliveryAddress = o.DeliveryAddress,  // ? ADD
                    Phone = o.Phone,
                }).ToListAsync();

            return Ok(orders);
        }
        #endregion

        #region GetOrdersByUser
        [Authorize(Roles = "Customer,Restaurant,Admin")]
        [HttpGet("user")]
        public async Task<IActionResult> GetOrdersByUser()
        {
            int userId = GetUserId();

            if (userId == 0)
                return Unauthorized();

            IQueryable<Order> query = _context.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Restaurant);

            if (IsCustomer())
            {
                query = query.Where(o => o.UserID == userId);
            }
            else if (IsRestaurant())
            {
                var restaurantIds = await _context.Restaurants
                    .Where(r => r.OwnerID == userId)
                    .Select(r => r.RestaurantID)
                    .ToListAsync();

                query = query.Where(o => restaurantIds.Contains(o.RestaurantID));
            }

            var orders = await query
                .Select(o => new OrderReadDto
                {
                    OrderID = o.OrderID,
                    OrderStatus = o.OrderStatus,
                    TotalAmount = o.TotalAmount,
                    OrderDate = o.OrderDate,
                    UserName = o.User.UserName,
                    RestaurantName = o.Restaurant.Name,
                    DeliveryAddress = o.DeliveryAddress,  // ? ADD
                    Phone = o.Phone,
                })
                .ToListAsync();

            return Ok(orders);
        }
        #endregion

        #region GetOrdersByRestaurant
        [Authorize(Roles = "Restaurant,Admin")]
        [HttpGet("restaurant/{restaurantId}")]
        public async Task<IActionResult> GetOrdersByRestaurant(int restaurantId)
        {
            int userId = GetUserId();

            if (!IsAdmin())
            {
                bool owns = await _context.Restaurants
                    .AnyAsync(r => r.RestaurantID == restaurantId && r.OwnerID == userId);

                if (!owns)
                    return Forbid();
            }

            var orders = await _context.Orders
                .AsNoTracking()
                .Include(o => o.User)
                .Include(o => o.Restaurant)
                .Where(o => o.RestaurantID == restaurantId)
                .Select(o => new OrderReadDto
                {
                    OrderID = o.OrderID,
                    OrderStatus = o.OrderStatus,
                    TotalAmount = o.TotalAmount,
                    OrderDate = o.OrderDate,
                    UserName = o.User.UserName,
                    RestaurantName = o.Restaurant.Name,
                    DeliveryAddress = o.DeliveryAddress,  // ? ADD
                    Phone = o.Phone,
                })
                .ToListAsync();

            return Ok(orders);
        }
        #endregion

        #region CreateOrder
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            int userId = GetUserId();

            if (userId == 0)
                return Unauthorized();

            if (dto.Items == null || !dto.Items.Any())
                return BadRequest("Order must contain at least one item");

            var restaurant = await _context.Restaurants
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.RestaurantID == dto.RestaurantID);

            if (restaurant == null)
                return NotFound("Restaurant not found");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = new Order
                {
                    UserID = userId,
                    RestaurantID = dto.RestaurantID,
                    OrderStatus = "Pending",
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = 0,
                    DeliveryAddress = dto.DeliveryAddress,  // ? ADD
                    Phone = dto.Phone,
                };

                await _context.Orders.AddAsync(order);
                await _context.SaveChangesAsync();

                decimal total = 0;

                foreach (var item in dto.Items)
                {
                    if (item.Quantity <= 0)
                        return BadRequest("Quantity must be greater than zero");

                    var menuItem = await _context.MenuItems
                        .AsNoTracking()
                        .FirstOrDefaultAsync(m => m.MenuItemID == item.MenuItemID);

                    if (menuItem == null)
                        return BadRequest($"Menu item {item.MenuItemID} not found");

                    // Important validation (Swiggy rule)
                    if (menuItem.RestaurantID != dto.RestaurantID)
                        return BadRequest("All items must belong to the same restaurant");

                    var orderItem = new OrderItem
                    {
                        OrderID = order.OrderID,
                        MenuItemID = item.MenuItemID,
                        Quantity = item.Quantity,
                        OrderItemPrice = menuItem.MenuItemPrice * item.Quantity,
                        
                    };

                    total += orderItem.OrderItemPrice;

                    await _context.OrderItems.AddAsync(orderItem);
                }

                order.TotalAmount = total;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Order placed successfully",
                    OrderID = order.OrderID,
                    TotalAmount = total
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Something went wrong while placing the order");
            }
        }
        #endregion

        #region UpdateOrderStatus
        [Authorize(Roles = "Restaurant")]
        [HttpPatch("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromQuery] string status)
        {
            int userId = GetUserId();

            var order = await _context.Orders
                .Include(o => o.Restaurant)
                .FirstOrDefaultAsync(o => o.OrderID == orderId);

            if (order == null)
                return NotFound("Order not found");

            if (order.Restaurant.OwnerID != userId)
                return Forbid();

            var allowedStatuses = new List<string>
    {
        "Pending",
        "Confirmed",
        "Preparing",
        "OutForDelivery",
        "Completed",
        "Cancelled"
    };

            if (!allowedStatuses.Contains(status))
                return BadRequest("Invalid order status");

            if (order.OrderStatus == "Completed")
                return BadRequest("Completed orders cannot be modified");

            order.OrderStatus = status;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Order status updated",
                OrderID = orderId,
                Status = status
            });
        }
        #endregion

        #region CancelOrder
        [Authorize(Roles = "Customer,Restaurant,Admin")]
        [HttpPatch("{orderId}/cancel")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            int userId = GetUserId();

            var order = await _context.Orders
                .Include(o => o.Restaurant)
                .FirstOrDefaultAsync(o => o.OrderID == orderId);

            if (order == null)
                return NotFound("Order not found");

            // Prevent cancelling completed orders
            if (order.OrderStatus == "Completed")
                return BadRequest("Completed orders cannot be cancelled");

            // Customer can cancel only their order
            if (IsCustomer() && order.UserID != userId)
                return Forbid("You can cancel only your own orders");

            // Restaurant can cancel only their restaurant orders
            if (IsRestaurant() && order.Restaurant.OwnerID != userId)
                return Forbid("You cannot cancel this order");

            // Admin can cancel any order (no check needed)

            order.OrderStatus = "Cancelled";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Order cancelled successfully",
                OrderID = orderId,
                Status = "Cancelled"
            });
        }
        #endregion
    }
}



