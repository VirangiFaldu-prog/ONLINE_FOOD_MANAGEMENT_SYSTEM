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
    public class OrderItemController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;

        public OrderItemController(RestaurantManagementContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst("UserID")?.Value ?? "0");

        private string GetUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value;


        #region UpdateOrderItem
        private async Task UpdateOrderTotal(int orderId)
        {
            var total = await _context.OrderItems
                .Where(i => i.OrderID == orderId)
                .SumAsync(i => i.OrderItemPrice);

            var order = await _context.Orders.FindAsync(orderId);

            if (order == null)
                return;

            order.TotalAmount = total;

            await _context.SaveChangesAsync();
        }
        #endregion

        #region GetItemsByOrder
        [Authorize(Roles = "Customer,Restaurant,Admin")]
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetItemsByOrder(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);

            if (order == null)
                return NotFound();

            var userId = GetUserId();
            var role = GetUserRole();

            if (role == "Customer" && order.UserID != userId)
                return Forbid();

            if (role == "Restaurant")
            {
                var ownsRestaurant = await _context.Restaurants
                    .AnyAsync(r => r.RestaurantID == order.RestaurantID && r.OwnerID == userId);

                if (!ownsRestaurant)
                    return Forbid();
            }


            var items = await _context.OrderItems
                .Where(i => i.OrderID == orderId)
                .Include(i => i.MenuItem)
                .Select(i => new
                {
                    orderItemID = i.OrderItemID,
                    quantity = i.Quantity,
                    orderItemPrice = i.OrderItemPrice,

                    menuItem = new
                    {
                        menuItemID = i.MenuItem.MenuItemID,
                        menuItemName = i.MenuItem.MenuItemName,
                        menuItemImage = i.MenuItem.ImageUrl
                    }
                })
                .ToListAsync();

            return Ok(items);
        }
        #endregion

        #region AddOrderItem
        [Authorize(Roles = "Customer")]
        [HttpPost("{orderId}")]
        public async Task<IActionResult> AddOrderItem(int orderId, OrderItemCreateDto dto)
        {
            int userId = GetUserId();

            var order = await _context.Orders
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.OrderID == orderId);

            if (order == null)
                return NotFound();

            if (order.UserID != userId)
                return Forbid();

            var menuItem = await _context.MenuItems.FindAsync(dto.MenuItemID);

            if (menuItem == null)
                return NotFound("MenuItem not found");

            if (menuItem.RestaurantID != order.RestaurantID)
                return BadRequest("Item must belong to the same restaurant as the order");

            if (dto.Quantity <= 0)
                return BadRequest("Quantity must be greater than zero");

            var orderItem = new OrderItem
            {
                OrderID = orderId,
                MenuItemID = dto.MenuItemID,
                Quantity = dto.Quantity,
                OrderItemPrice = menuItem.MenuItemPrice * dto.Quantity
            };

           

            _context.OrderItems.Add(orderItem);

            await _context.SaveChangesAsync();

            await UpdateOrderTotal(orderId);

            return Ok("Item added");
        }
        #endregion

        #region DeleteOrderItem
        [Authorize(Roles = "Customer")]
        [HttpDelete("{orderItemId}")]
        public async Task<IActionResult> DeleteOrderItem(int orderItemId)
        {
            int userId = GetUserId();

            var orderItem = await _context.OrderItems
                .Include(o => o.Order)
                .FirstOrDefaultAsync(o => o.OrderItemID == orderItemId);

            if (orderItem == null)
                return NotFound();

            if (orderItem.Order.UserID != userId)
                return Forbid();

            int orderId = orderItem.OrderID;

            _context.OrderItems.Remove(orderItem);

            await _context.SaveChangesAsync();

            await UpdateOrderTotal(orderId);

            return Ok("Item removed");
        }
        #endregion
    }
}